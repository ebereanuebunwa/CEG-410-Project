// AUTHOR: Kadiri Victor

// The file contains the main calculations for the beam analysis

// the format of the received parameters is as follows
// 1.) Beam Length {float}
// 2.) Supports {array of support objects} e.g
// [{supportNo: 1, type: 'Roller', location: 0},{supportNo: 2, type: 'Hinge', location: 6},{supportNo: 3, type: 'Fixed', location: 12}]
// 3.) Sections {array  of section objects for each span(the rest of the section objects inherit the Moi and YoungMod properties of the first section object in the array)}
// [{Moi: null or value, YoungMod: null, Coefficient: 1},{Moi: null or value, YoungMod: null, Coefficient: 1}]
// 4.) Settlement {array of settlement values(non-negative) for each support}
// [12, 34, 23]
// 5.) pointLoads { array of point Load objects(non negative magnitude)}
// [{location: 0, magnitude: 12}, {location: 6, magnitude: 5}, {location: 12, magnitude: 24}]
// 6.) distributedLoads {array of distributed Load objects(non negative magnitude)}
// [{start: 3, end: 4, startMag: 15, endMag: 15},{start: 6, end: 8, startMag: 12, endMag: 0},
// {start: 0, end: 2, startMag: 30, endMag: 10}]
// 7.) Moments {array of moment objects(either positive or negative magnitude)}
// [{position: 12, magnitude: 19},{position: 10, magnitude: -12}]
// 8.) noOfSpans {a calculated no of spans}

// create a doc for the received parameters
/**
 * @param {float} beamLength
 * @param {array} supports
 * @param {array} sections
 * @param {array} settlements
 * @param {array} pointLoads
 * @param {array} distributedLoads
 * @param {array} moments
 * @param {int} noOfSpans
 */
let receivedParameters;

export function setParameters(params) {
  receivedParameters = params;
  console.log("Received parameters:", receivedParameters);
  // Perform further processing with the received parameters
  addFreeEndSupports();
  recalibrateSupports();
  const spans = splitBeamIntoSpans();
  const FixedEndMoments = calculateFixedEndMoments(spans);
  let expressionsArray = generateMemberEndMomentExpressions(spans, FixedEndMoments);
  const expressionsWithEliminatedknowns = eliminateKnownVariables(expressionsArray, spans);
  const Equations = createEquations(expressionsWithEliminatedknowns, spans, FixedEndMoments);
  const solution = solveEquations(Equations);
  const expressionsWithSolutions = addSolutionsToExpressions(solution, expressionsWithEliminatedknowns);
  const expressionsSimplified = simplifyExpressions(expressionsWithSolutions);
  const expressionsWithFreeEndSpan = addMemberEndMomentEquationsForFreeEndSpans(expressionsSimplified, FixedEndMoments, spans);
  const expressionsFinal = addSpanNumbersToMemberEndMomentEquations(expressionsWithFreeEndSpan);
  displayMemberEndMoments(expressionsFinal);
  displayFixedEndMoments(FixedEndMoments);
  displayMemberEndMomentExpressions(expressionsArray);
  displayMemberEndMomentExpressionsWithEliminatedKnowns(expressionsWithEliminatedknowns);
  displayEquations(Equations);
  displaySolutions(solution);
}

// function to add free end supports to the supports array
// works on the support object such that if the location of the first support is not 0, 
// then add a new support object at location 0 with type 'Free end', and if the location 
// of the last support is not equal to the beam length, then add a new support object at the beam length with type 'Free end'
// The function returns the modified supports array
// The function also adds the corresponding settlement value to the settlements array
function addFreeEndSupports() {
  let supports = receivedParameters.supports;
  let beamLength = receivedParameters.beamLength;
  let settlements = receivedParameters.settlements;
  if (supports[0].location !== 0) {
    supports.unshift({ supportNo: 0, type: 'Free end', location: 0 });
    settlements.unshift(0);
  }
  if (supports[supports.length - 1].location !== beamLength) {
    supports.push({ supportNo: supports.length + 1, type: 'Free end', location: beamLength });
    settlements.push(0);
  }
  console.log("Supports with free ends:", supports);
  return supports;
}

// function to recalibrate the supports array
// it changes the supportNo property of each support object in the supports array, such that the supportNo property of the first support object is 1 and the supportNo property of the last support object is equal to the length of the supports array
function recalibrateSupports() {
  let supports = receivedParameters.supports;
  supports.forEach((support, index) => {
    support.supportNo = index + 1;
  });
  console.log("Recalibrated supports:", supports);
}

// S P L I T T I N G  B E A M S  I N T O  S P A N S

// The function splits the beam into spans
// The function returns an array of spans
// Each span is an object with the following properties
// 1.) spanNo {int} - the span number
// 2.) start {float} - the start location of the span
// 3.) end {float} - the end location of the span
// 4.) length {float} - the length of the span
// 5.) supports {array} - the supports in the span e.g [{supportNo: 1, type: 'Roller', location: 0},{supportNo: 2, type: 'Hinge', location: 6}] or [{supportNo: 1, type: 'Free end', location: 0},{supportNo: 2, type: 'Hinge', location: 6}, {supportNo: 3, type: 'Fixed', location: 12}]
// 6.) section of the span {object} - the section object of the span e.g {Moi: null or value, YoungMod: null, Coefficient: 1}
// 7.) settlements of the supports {array} - the settlements of the supports in the span e.g [12, 34]
// 8.) pointLoads in the span {array} - the point loads in the span e.g [{location: 0, magnitude: 12}, {location: 6, magnitude: 5}]
// 9.) distributedLoads in the span {array} - the distributed loads in the span e.g [{start: 3, end: 4, startMag: 15, endMag: 15},{start: 6, end: 8, startMag: 12, endMag: 0}]
// 10.) moments in the span {array} - the moments in the span e.g [{position: 12, magnitude: 19},{position: 10, magnitude: -12}]
// Note that: each span has varying length so it is important to calculate the length of each span by using the supports in the span

// The function also filters the point loads, distributed loads and moments in the span

// There are five cases to consider when filtering the distributed loads in the span
// 1.) The start and end of the distributed load are within the span, if so then include the distributed load in the span
// 2.) The start of the distributed load is within the span and the end is outside the span, if so change the end of the distributed load to the end of the span and include the distributed load in the span, for varying distributed loads, calculate the magnitude at the end of the span
// 3.) The start of the distributed load is outside the span and the end is within the span, if so change the start of the distributed load to the start of the span and include the distributed load in the span, for varying distributed loads, calculate the magnitude at the start of the span
// 4.) The start and end of the distributed load are outside the span, if so then exclude the distributed load from the span
// 5.) The start and end of the distributed load are outside the span, but the span length falls within the start and end of the distributed load, if so change the start and end of the distributed load to the start and end of the span and include the distributed load in the span and calculate the magnitude at the start and end of the span for varying distributed loads


function splitBeamIntoSpans() {
  let beamLength = receivedParameters.beamLength;
  let supports = receivedParameters.supports;
  let sections = receivedParameters.sections;
  let settlements = receivedParameters.settlements;
  let pointLoads = receivedParameters.pointLoads;
  let distributedLoads = receivedParameters.distributedLoads;
  let moments = receivedParameters.moments;
  let noOfSpans = receivedParameters.noOfSpans;
  let spans = [];

  // sort the supports array in ascending order of location
  supports.sort((a, b) => a.location - b.location);
  console.log("Sorted supports:", supports);

  for (let i = 0; i < noOfSpans; i++) {
    let span = {};
    span.spanNo = i + 1;
    span.start = supports[i].location;
    span.end = supports[i + 1].location;
    span.length = span.end - span.start;
    span.supports = [supports[i], supports[i + 1]];
    span.section = sections[i];
    span.settlements = [settlements[i], settlements[i + 1]];
    // filter the point loads in the span
    span.pointLoads = pointLoads.filter((load) => load.location >= span.start && load.location <= span.end);

    // filter the distributed loads in the span
    span.distributedLoads = distributedLoads.map((load) => {
      if (load.start >= span.start && load.end <= span.end) {
        return load;
      } else if (load.start >= span.start && load.end > span.end && load.start < span.end) {
        const newLoad = { ...load };
        newLoad.end = span.end;
        if (newLoad.startMag !== newLoad.endMag) {
          if (newLoad.startMag < newLoad.endMag) {
            if (newLoad.startMag === 0) {
              const x2 = load.end - load.start;
              const x1 = newLoad.end - load.start;
              const y2 = newLoad.endMag;
              const y1 = (x1 * y2) / x2;
              newLoad.endMag = y1;
            } else {
              const x2 = load.end - load.start;
              const x1 = newLoad.end - load.start;
              const y2 = newLoad.endMag - newLoad.startMag;
              const y1 = (x1 * y2) / x2;
              newLoad.endMag = newLoad.startMag + y1;
            }
          }
          if (newLoad.startMag > newLoad.endMag) {
            if (newLoad.endMag === 0) {
              const x2 = load.end - load.start;
              const x1 = load.end - newLoad.end;
              const y2 = newLoad.startMag;
              const y1 = (x1 * y2) / x2;
              newLoad.endMag = y1;
            } else {
              const x2 = load.end - load.start;
              const x1 = load.end - newLoad.end;
              const y2 = newLoad.startMag - newLoad.endMag;
              const y1 = (x1 * y2) / x2;
              newLoad.endMag = newLoad.endMag + y1;
            }
          }
        }
        return newLoad;
      } else if (load.start < span.start && load.end <= span.end && load.end > span.start) {
        const newLoad = { ...load };
        newLoad.start = span.start;
        if (newLoad.startMag !== newLoad.endMag) {
          if (newLoad.startMag < newLoad.endMag) {
            if (newLoad.startMag === 0) {
              const x2 = load.end - load.start;
              const x1 = newLoad.start - load.start;
              const y2 = newLoad.endMag;
              const y1 = (x1 * y2) / x2;
              newLoad.startMag = y1;
            } else {
              const x2 = load.end - load.start;
              const x1 = newLoad.start - load.start;
              const y2 = newLoad.endMag - newLoad.startMag;
              const y1 = (x1 * y2) / x2;
              newLoad.startMag = newLoad.startMag + y1;
            }
          }
          if (newLoad.startMag > newLoad.endMag) {
            if (newLoad.endMag === 0) {
              const x2 = load.end - load.start;
              const x1 = load.end - newLoad.start;
              const y2 = newLoad.startMag;
              const y1 = (x1 * y2) / x2;
              newLoad.startMag = y1;
            } else {
              const x2 = load.end - load.start;
              const x1 = load.end - newLoad.start;
              const y2 = newLoad.startMag - newLoad.endMag;
              const y1 = (x1 * y2) / x2;
              newLoad.startMag = newLoad.endMag + y1;
            }
          }
        }
        return newLoad;
      } else if (load.start < span.start && load.end > span.end && load.start < span.end) {
        const newLoad = { ...load };
        newLoad.start = span.start;
        newLoad.end = span.end;
        if (newLoad.startMag !== newLoad.endMag) {
          if (newLoad.startMag < newLoad.endMag) {
            if (newLoad.startMag === 0) {
              const x1a = newLoad.start - load.start;
              const x1b = newLoad.end - load.start;
              const x2 = load.end - load.start;
              const y2 = newLoad.endMag;
              const y1a = (x1a * y2) / x2;
              const y1b = (x1b * y2) / x2;
              newLoad.startMag = y1a;
              newLoad.endMag = y1b;
            } else {
              const x1a = newLoad.start - load.start;
              const x1b = newLoad.end - load.start;
              const x2 = load.end - load.start;
              const y2 = newLoad.endMag - newLoad.startMag;
              const y1a = (x1a * y2) / x2;
              const y1b = (x1b * y2) / x2;
              newLoad.endMag = newLoad.startMag + y1b;
              newLoad.startMag = newLoad.startMag + y1a;
            }
          }
          if (newLoad.startMag > newLoad.endMag) {
            if (newLoad.endMag === 0) {
              const x1a = load.end - newLoad.end
              const x1b = load.end - newLoad.start;
              const x2 = load.end - load.start;
              const y2 = newLoad.startMag;
              const y1a = (x1a * y2) / x2;
              const y1b = (x1b * y2) / x2;
              newLoad.startMag = y1b;
              newLoad.endMag = y1a;
            } else {
              const x1a = load.end - newLoad.end;
              const x1b = load.end - newLoad.start;
              const x2 = load.end - load.start;
              const y2 = newLoad.startMag - newLoad.endMag;
              const y1a = (x1a * y2) / x2;
              const y1b = (x1b * y2) / x2;
              newLoad.startMag = newLoad.endMag + y1b;
              newLoad.endMag = newLoad.endMag + y1a;
            }
          }
        }
        return newLoad;
      }
    });
    span.moments = moments.filter((moment) => moment.position >= span.start && moment.position <= span.end);
    spans.push(span);
  }
  console.log("Spans:", spans);
  return spans;
}

// F I X E D  E N D  M O M E N T S  C A L C U L A T I O N S  I N T E G R A T I O N  and  S U P E R P O S I T I O N 

// The function calculates the fixed end moments for each span

// The function returns an array of fixed end moments objects for each span in the beam. E.g [{spanNo: 1, M+"{span.supports[0].supportNo}"+"span.{supports[1].supportNo}": 12, M+"{span.supports[1].supportNo}"+"span.{supports[0].supportNo}": -12}, {spanNo: 2, M+"{span.supports[0].supportNo}"+"span.{supports[1].supportNo}": 12, M+"{span.supports[1].supportNo}"+"span.{supports[0].supportNo}": -12}]
// The fixed end moments are calculated using the following steps
// 1.) check if the span has a free end support, if so then calculate the fixed end moment for the spans with a free end, if span has no free end support then calculate the fixed end moments for the spans with fixed end supports

// create a template for the function to calculate the fixed end moments


function calculateFixedEndMoments(spans) {
  let femArray = [];
  spans.forEach((span) => {
    if (span.supports[0].type === 'Free end' || span.supports[1].type === 'Free end') {
      // calculate the fixed end moments for the spans with a free end
      if (span.supports[0].type === 'Free end') {
        femArray.push(calculateFixedEndMomentsForLeftFreeEndSpans(span));
      } else {
        femArray.push(calculateFixedEndMomentsForRightFreeEndSpans(span));
      }
    } else {
      // calculate the fixed end moments for the spans with fixed end supports
      femArray.push(calculateFixedEndMomentsForFixedEndSpans(span));
    }

  });
  console.log("Fixed end moments:", femArray);
  return femArray;
}

// function to calculate the fixed end moments for the spans with a free end support at the left end
// The function returns an object with the fixed end moments for the span
// The object has the following properties which differs from the other fixed end moments objects, by the fact that the span has a free end support at the left end and at that end, the fixed end moment is zero
// 1.) spanNo {int} - the span number
// 2.) FEM+"{span.supports[1].supportNo}"+"span.{supports[0].supportNo} {float} - the fixed end moment at the right end of the span
// It is found for the following loading conditions for every load in the span
// 1.) point loads - the fixed end moment is equal to the magnitude of the point load multiplied by the distance from the point load to the right end of the span
// 2.) distributed loads - the fixed end moment is equal to the area of the distributed load diagram multiplied by the distance from the centroid of the distributed load diagram to the right end of the span
// 3.) moments - the fixed end moment is given by a formula to be provided later
function calculateFixedEndMomentsForLeftFreeEndSpans(span) {
  let fem = {};
  fem.spanNo = span.spanNo;
  fem[`FEM${span.supports[1].supportNo}${span.supports[0].supportNo}`] = 0;
  span.pointLoads.forEach((load) => {
    fem[`FEM${span.supports[1].supportNo}${span.supports[0].supportNo}`] += -(load.magnitude * (span.end - load.location));
  });
  span.distributedLoads.forEach((load) => {
    if (load) {
      if (load.startMag === load.endMag) {
        const midLoadpoint = (load.start + load.end) / 2;
        const midLoadToEnd = span.end - midLoadpoint;
        fem[`FEM${span.supports[1].supportNo}${span.supports[0].supportNo}`] += -(load.startMag * midLoadToEnd * (load.end - load.start));
      } else {
        if (load.startMag < load.endMag) {
          if (load.startMag === 0) {
            const base = load.end - load.start;
            const height = load.endMag;
            const area = (base * height) / 2;
            const centroid = (1 / 3 * base) + (span.end - load.end);
            fem[`FEM${span.supports[1].supportNo}${span.supports[0].supportNo}`] += -(area * centroid);
          } else {
            const base = load.end - load.start;
            const triheight = load.endMag - load.startMag;
            const recheight = load.startMag;
            const triarea = (base * triheight) / 2;
            const recarea = base * recheight;
            const tricentroid = (1 / 3 * base) + (span.end - load.end);
            const reccentroid = (1 / 2 * base) + (span.end - load.end);
            fem[`FEM${span.supports[1].supportNo}${span.supports[0].supportNo}`] += -((triarea * tricentroid) + (recarea * reccentroid));
          }

        }
        if (load.startMag > load.endMag) {
          if (load.endMag === 0) {
            const base = load.end - load.start;
            const height = load.startMag;
            const area = (base * height) / 2;
            const centroid = (2 / 3 * base) + (span.end - load.end);
            fem[`FEM${span.supports[1].supportNo}${span.supports[0].supportNo}`] += -(area * centroid);
          } else {
            const base = load.end - load.start;
            const triheight = load.startMag - load.endMag;
            const recheight = load.endMag;
            const triarea = (base * triheight) / 2;
            const recarea = base * recheight;
            const tricentroid = (2 / 3 * base) + (span.end - load.end);
            const reccentroid = (1 / 2 * base) + (span.end - load.end);
            fem[`FEM${span.supports[1].supportNo}${span.supports[0].supportNo}`] += -((triarea * tricentroid) + (recarea * reccentroid));
          }
        }
      }
    }

  });
  span.moments.forEach((moment) => {
    fem[`FEM${span.supports[1].supportNo}${span.supports[0].supportNo}`] += moment.magnitude;
  });
  return fem;
}

// function to calculate the fixed end moments for the spans with a free end support at the right end
// The function returns an object with the fixed end moments for the span
// The object has the following properties which differs from the other fixed end moments objects, by the fact that the span has a free end support at the right end and at that end, the fixed end moment is zero
// 1.) spanNo {int} - the span number
// 2.) M+"{span.supports[0].supportNo}"+"span.{supports[1].supportNo} {float} - the fixed end moment at the left end of the span
// It is found for the following loading conditions for every load in the span
// 1.) point loads - the fixed end moment is equal to the magnitude of the point load multiplied by the distance from the point load to the left end of the span
// 2.) distributed loads - the fixed end moment is equal to the area of the distributed load diagram multiplied by the distance from the centroid of the distributed load diagram to the left end of the span
// 3.) moments - the fixed end moment is given by a formula to be provided later

function calculateFixedEndMomentsForRightFreeEndSpans(span) {
  let fem = {};
  fem.spanNo = span.spanNo;
  fem[`FEM${span.supports[0].supportNo}${span.supports[1].supportNo}`] = 0;
  span.pointLoads.forEach((load) => {
    fem[`FEM${span.supports[0].supportNo}${span.supports[1].supportNo}`] += (load.magnitude * (load.location - span.start));
  });
  span.distributedLoads.forEach((load) => {
    if (load) {
      if (load.startMag === load.endMag) {
        const midLoadpoint = (load.start + load.end) / 2;
        const midLoadToEnd = midLoadpoint - span.start;
        fem[`FEM${span.supports[0].supportNo}${span.supports[1].supportNo}`] += (load.startMag * midLoadToEnd * (load.end - load.start));
      } else {
        if (load.startMag < load.endMag) {
          if (load.startMag === 0) {
            const base = load.end - load.start;
            const height = load.endMag;
            const area = (base * height) / 2;
            const centroid = (2 / 3 * base) + (load.start - span.start);
            fem[`FEM${span.supports[0].supportNo}${span.supports[1].supportNo}`] += (area * centroid);
          } else {
            const base = load.end - load.start;
            const triheight = load.endMag - load.startMag;
            const recheight = load.startMag;
            const triarea = (base * triheight) / 2;
            const recarea = base * recheight;
            const tricentroid = (2 / 3 * base) + (load.start - span.start);
            const reccentroid = (1 / 2 * base) + (load.start - span.start);
            fem[`FEM${span.supports[0].supportNo}${span.supports[1].supportNo}`] += ((triarea * tricentroid) + (recarea * reccentroid));
          }

        }
        if (load.startMag > load.endMag) {
          if (load.endMag === 0) {
            const base = load.end - load.start;
            const height = load.startMag;
            const area = (base * height) / 2;
            const centroid = (1 / 3 * base) + (load.start - span.start);
            console.log(area, centroid); // remove later
            fem[`FEM${span.supports[0].supportNo}${span.supports[1].supportNo}`] += (area * centroid);
          }
          else {
            const base = load.end - load.start;
            const triheight = load.startMag - load.endMag;
            const recheight = load.endMag;
            const triarea = (base * triheight) / 2;
            const recarea = base * recheight;
            const tricentroid = (1 / 3 * base) + (load.start - span.start);
            const reccentroid = (1 / 2 * base) + (load.start - span.start);
            fem[`FEM${span.supports[0].supportNo}${span.supports[1].supportNo}`] += ((triarea * tricentroid) + (recarea * reccentroid));
          }
        }
      }
    }
  }
  );
  span.moments.forEach((moment) => {
    fem[`FEM${span.supports[0].supportNo}${span.supports[1].supportNo}`] += moment.magnitude;
  });
  return fem;
}

// function to calculate the fixed end moments for the spans with no free end supports at both ends, in this case the fixed end moments are calculated for the following loading conditions for every load in the span
// 1.) point Loads - is done by the formula to be provided later
// 2.) distributed loads - is done by integrating each elemental load of the distributed load diagram to find the fixed end moment, integration to be done using the math.js library
// 3.) moments - the fixed end moment is given by a formula to be provided later

function calculateFixedEndMomentsForFixedEndSpans(span) {
  let fem = {};
  fem.spanNo = span.spanNo;
  fem[`FEM${span.supports[0].supportNo}${span.supports[1].supportNo}`] = 0;
  fem[`FEM${span.supports[1].supportNo}${span.supports[0].supportNo}`] = 0;
  span.pointLoads.forEach((load) => {
    // each point load has a fixed end moment at both ends of the span,
    // for the left end (i.e M12) the formula is given by the following formula, M12 = +((P * a * b^2)/l^2)
    // for the right end (i.e M21) the formula is given by the following formula, M21 = -((P * b * a^2)/l^2)
    // where P is the magnitude of the point load, a is the distance from the point load to the left end of the span, b is the distance from the point load to the right end of the span, and l is the length of the span
    const a = load.location - span.start;
    const b = span.end - load.location;
    const l = span.length;
    const p = load.magnitude;
    fem[`FEM${span.supports[0].supportNo}${span.supports[1].supportNo}`] += ((p * a * b * b) / (l * l));
    fem[`FEM${span.supports[1].supportNo}${span.supports[0].supportNo}`] += -((p * b * a * a) / (l * l));
  });
  span.distributedLoads.forEach((load) => {
    if (load) {
      if (load.startMag === load.endMag) {
        // for distributed loads we are taking an integral approach based on the formulas using the pointLoads approach
        // to find the left end (i.e M12), we take the integral of the expression ((y* x * (l-x)^2)/l^2) from a to b, where y is the elemental load, x is the distance from the left end of the span, l is the length of the span, a is the start of the distributed load, and b is the end of the distributed load.
        // for the right end (i.e M21), we take the negative of the integral of the expression ((y * (l-x) * x^2)/l^2) from a to b, where y is the elemental load, x is the distance from the left end of the span, l is the length of the span, a is the start of the distributed load, and b is the end of the distributed load.
        // for udl, y = pdx, where p is the magnitude of the udl, and dx is the elemental load
        const a = load.start - span.start;
        const b = load.end - span.start;
        const l = span.length;
        const p = load.startMag;
        // using the nerdamer library instead to integrate the expression
        // syntax: nerdamer('defint(e^(cos(x)), 1, 2)');

        const expressionLeft = `(${p} * x * (${l} - x)^2)/${l}^2`;
        console.log(expressionLeft);
        const integralforleftFEM = parseFloat(nerdamer(`defint(${expressionLeft}, ${a}, ${b})`).text());
        fem[`FEM${span.supports[0].supportNo}${span.supports[1].supportNo}`] += integralforleftFEM;
        const expressionRight = `(${p} * (${l} - x) * x^2)/${l}^2`;
        const integralforrightFEM = parseFloat(nerdamer(`defint(${expressionRight}, ${a}, ${b})`).text());
        fem[`FEM${span.supports[1].supportNo}${span.supports[0].supportNo}`] += -integralforrightFEM;
      }
      if (load.startMag < load.endMag) {
        if (load.startMag === 0) {
          // for varying distributed loads, we are taking an integral approach based on the formulas using the pointLoads approach also
          // for vdl, y is found by the equation of the line y = mx + c.
          // to find the equation for load.startMag < load.endMag, we use the expression(derived from similar triangles) y = (p*(x - a))/(b - a), where p is endMag of the vdl, x is the distance from the left end of the span(variable), a is the distance to the start of the distributed load, and b is distance to the end of the distributed load.
          // find y in terms of x,
          // for the left end (i.e M12), we take the integral of the expression ((y* x * (l-x)^2)/l^2) from a to b, where y is the elemental load, x is the distance from the left end of the span, l is the length of the span, a is the start of the distributed load, and b is the end of the distributed load.
          // for the right end (i.e M21), we take the negative of the integral of the expression ((y * (l-x) * x^2)/l^2) from a to b, where y is the elemental load, x is the distance from the left end of the span, l is the length of the span, a is the start of the distributed load, and b is the end of the distributed load.
          const a = load.start - span.start;
          const b = load.end - span.start;
          const l = span.length;
          const p = load.endMag;
          const expression = `(${p} * (x - ${a})) / (${b} - ${a})`;
          console.log(expression);
          const integralforleftFEM = parseFloat(nerdamer(`defint((${expression} * x * (${l} - x)^2)/${l}^2, ${a}, ${b})`).text());
          fem[`FEM${span.supports[0].supportNo}${span.supports[1].supportNo}`] += integralforleftFEM;
          const integralforrightFEM = parseFloat(nerdamer(`defint((${expression} * (${l} - x) * x^2)/${l}^2, ${a}, ${b})`).text());
          fem[`FEM${span.supports[1].supportNo}${span.supports[0].supportNo}`] += -integralforrightFEM;

          // const simplifiedExpression = math.simplify(expression);
          // const integralforleftFEM = math.integral(`((${simplifiedExpression} * x * (${l} - x)^2)/${l}^2)`, 'x', a, b);
          // fem[`M${span.supports[0].supportNo}${span.supports[1].supportNo}`] += integralforleftFEM;
          // const integralforrightFEM = math.integral(`((${simplifiedExpression} * (${l} - x) * x^2)/${l}^2)`, 'x', a, b);
          // fem[`M${span.supports[1].supportNo}${span.supports[0].supportNo}`] += -integralforrightFEM;
        } else {
          // here y = ((p2-p1)*(x-a)/(b-a)) + p1, where p1 is startMag and p2 is endMag, x is the distance from the left end of the span(variable), a is the distance to the start of the distributed load, and b is distance to the end of the distributed load.
          const a = load.start - span.start;
          const b = load.end - span.start;
          const l = span.length;
          const p1 = load.startMag;
          const p2 = load.endMag;
          const expression = `((${p2} - ${p1})*(x - ${a})/(${b} - ${a})) + ${p1}`;
          console.log(expression);
          const integralforleftFEM = parseFloat(nerdamer(`defint((${expression} * x * (${l} - x)^2)/${l}^2, ${a}, ${b})`).text());
          fem[`FEM${span.supports[0].supportNo}${span.supports[1].supportNo}`] += integralforleftFEM;
          const integralforrightFEM = parseFloat(nerdamer(`defint((${expression} * (${l} - x) * x^2)/${l}^2, ${a}, ${b})`).text());
          fem[`FEM${span.supports[1].supportNo}${span.supports[0].supportNo}`] += -integralforrightFEM;

          // const simplifiedExpression = math.simplify(expression);
          // const integralforleftFEM = math.integral(`((${simplifiedExpression} * x * (${l} - x)^2)/${l}^2)`, 'x', a, b);
          // fem[`M${span.supports[0].supportNo}${span.supports[1].supportNo}`] += integralforleftFEM;
          // const integralforrightFEM = math.integral(`((${simplifiedExpression} * (${l} - x) * x^2)/${l}^2)`, 'x', a, b);
          // fem[`M${span.supports[1].supportNo}${span.supports[0].supportNo}`] += -integralforrightFEM;
        }
      }
      if (load.startMag > load.endMag) {
        if (load.endMag === 0) {
          // here y = (p*(b-x)/(b-a)), where p is startMag of the vdl, x is the distance from the left end of the span(variable), a is the distance to the start of the distributed load, and b is distance to the end of the distributed load.
          const a = load.start - span.start;
          const b = load.end - span.start;
          const l = span.length;
          const p = load.startMag;
          const expression = `(${p} * (${b} - x)/(${b}-${a}))`;
          console.log(expression);
          const integralforleftFEM = parseFloat(nerdamer(`defint((${expression} * x * (${l} - x)^2)/${l}^2, ${a}, ${b})`).text());
          fem[`FEM${span.supports[0].supportNo}${span.supports[1].supportNo}`] += integralforleftFEM;
          const integralforrightFEM = parseFloat(nerdamer(`defint((${expression} * (${l} - x) * x^2)/${l}^2, ${a}, ${b})`).text());
          fem[`FEM${span.supports[1].supportNo}${span.supports[0].supportNo}`] += -integralforrightFEM;

          // const simplifiedExpression = math.simplify(expression);
          // const integralforleftFEM = math.integral(`((${simplifiedExpression} * x * (${l} - x)^2)/${l}^2)`, 'x', a, b);
          // fem[`M${span.supports[0].supportNo}${span.supports[1].supportNo}`] += integralforleftFEM;
          // const integralforrightFEM = math.integral(`((${simplifiedExpression} * (${l} - x) * x^2)/${l}^2)`, 'x', a, b);
          // fem[`M${span.supports[1].supportNo}${span.supports[0].supportNo}`] += -integralforrightFEM;
        }
        else {
          // here y = ((p2-p1)*(b-x)/(b-a)) + p1, where p2 is startMag and p1 is endMag, x is the distance from the left end of the span(variable), a is the distance to the start of the distributed load, and b is distance to the end of the distributed load.
          const a = load.start - span.start;
          const b = load.end - span.start;
          const l = span.length;
          const p1 = load.endMag;
          const p2 = load.startMag;
          const expression = `((${p2} - ${p1})*(${b}-x)/(${b}-${a})) + ${p1}`;
          console.log(expression);
          const integralforleftFEM = parseFloat(nerdamer(`defint((${expression} * x * (${l} - x)^2)/${l}^2, ${a}, ${b})`).text());
          fem[`FEM${span.supports[0].supportNo}${span.supports[1].supportNo}`] += integralforleftFEM;
          const integralforrightFEM = parseFloat(nerdamer(`defint((${expression} * (${l} - x) * x^2)/${l}^2, ${a}, ${b})`).text());
          fem[`FEM${span.supports[1].supportNo}${span.supports[0].supportNo}`] += -integralforrightFEM;

          // const simplifiedExpression = math.simplify(expression);
          // const integralforleftFEM = math.integral(`((${simplifiedExpression} * x * (${l} - x)^2)/${l}^2)`, 'x', a, b);
          // fem[`M${span.supports[0].supportNo}${span.supports[1].supportNo}`] += integralforleftFEM;
          // const integralforrightFEM = math.integral(`((${simplifiedExpression} * (${l} - x) * x^2)/${l}^2)`, 'x', a, b);
          // fem[`M${span.supports[1].supportNo}${span.supports[0].supportNo}`] += -integralforrightFEM;
        }
      }
    }
  });
  span.moments.forEach((moment) => {
    // each moment has a fixed end moment at both ends of the span,
    // for the left end (i.e M12) the formula is given by the following formula, M12 = (M*b*(2a - b))/(l^2)
    // for the right end (i.e M21) the formula is given by the following formula, M21 = (M*a*(2b - a))/(l^2)
    // where M is the magnitude of the moment, a is the distance from the moment to the left end of the span, b is the distance from the moment to the right end of the span, and l is the length of the span
    const a = moment.position - span.start;
    const b = span.end - moment.position;
    const l = span.length;
    const M = moment.magnitude;
    fem[`FEM${span.supports[0].supportNo}${span.supports[1].supportNo}`] += (M * b * (2 * a - b)) / (l * l);
    fem[`FEM${span.supports[1].supportNo}${span.supports[0].supportNo}`] += (M * a * (2 * b - a)) / (l * l);
  });
  return fem;
}


// M E M B E R   E N D  M O M E N T  E Q U A T I O N S  G E N E R A T I O N

// The function generates the member end moment equations for each span in the beam
// The member end moment equations for one end is given by the following general EXPRESSIONS,
// Mab = FEMab + 2EI/L * (2θa + θb - 3δ/L)
// Mba = FEMba + 2EI/L * (2θb + θa - 3δ/L)
// where Mab is the member end moment equation, FEMab is the fixed end moment of current side(i.e M12 = FEM12 and FEMba = M21), E is the modulus of elasticity, I is the moment of inertia, L is the length of the span, θa is the rotation at the left end of the span, θb is the rotation at the right end of the span, and δ is the differential settlement between the left and right end of the span
// δ is given by the following formula, δ = δ2 - δ1, where δ1 is the settlement at the left end of the span, and δ2 is the settlement at the right end of the span(settlement is given in span object as a property, if it undefined then δ = 0)
// θa, θb are the unknowns in the member end moment equations, and they are found by solving the simultaneous equations of equilibrium of the span
// θa or θb at a fixed end is zero
// No moment equation is found at a free end support
// if for a span, there exists a free end support at one end, then the member end moment equation for that end is not generated and the moment equation for the other end is unneccessary as the moment there is equal to Fixed end moment at that end
// the equilibrium conditions occurs at the joints in the beam(at joint, M21 + M23 = 0, M32+M34 = 0, M43 + M45 = 0, etc)

// The following steps are to be done in the order below

// 1.) Generate the expressions then convert them to simplified STRINGS for every span, except for spans with a free end.(Mind the differential settlement) return as an array of object strings [M12: 'expression', M21: 'expression'..., Mn(n-1): 'expression' e.t.c]

// 2.) ELIMINATE the known variables in the expression
// For ends fixed(for fixed end as first or last support) set θ1 and θn to be ZERO (i.e for the first and last expression in the array of expressions

// 3.) CREATION OF EQUATIONS (by equilibrium and exterior roller)
// MOMENT EQUATION FOR EXTERNAL ROLLER
// 1.) This is For the one end fixed continuous beam(i.e has one fixed end and one end that is not fixed),
// 2.) If has an external roller or hinge support  set M12 to zero (if the roller or hinge is the first support) or M(n-1)n to zero (if the roller or hinge is the last support)
// 3.) If has a free end as the last or first support, then set the 2nd to the last or 2nd support Moment (M(n-1)(n-2) or M21 to the negative of the FEM of the free end span) developing an equation M(n-1)(n-2) = -FEM(n-1)n or M21 = -FEM21.

// Return the equations in string format, simplify then add them to the equations array).

// MOMENT EQUATIONS FOR INTERNAL JOINT MEMBERS
// For all the inner joints, add the expressions in the array of expressions equating them to zero (e.g M21+M23 =0, M32+M34=0..., M(n-1)n + M(n-2)(n-1)= 0 e.t.c)

// then convert the equations to string format and simplifying them then adding them into the the equations array

// 4.) Solve the linear equations in the equations array with nerdamer 

// 5.) Return the solution as an array of objects, each object contains the span number and the member end moment equations for the span
// e.g [{spanNo: 1, M12: 'expression', M21: 'expression'}, {spanNo: 2, M12: 'expression', M21: 'expression'}]


function generateMemberEndMomentExpressions(spans, fixedEndMoments) {
  let expressionsArray = [];
  spans.forEach((span) => {
    // if any support is free, then the member end moment expression for the span is not generated
    // The FEMs in the expression are gotten from the fixed end moments array
    // The differential settlement is gotten from the span object: if the settlements are undefined, then the differential settlement is zero
    // The modulus of elasticity and the moment of inertia are gotten from the section property of the span object, section: {Moi: ignore, YoungMod: ignore, Coefficient: int}. If the section property is undefined, then the modulus of elasticity and the moment of inertia are set to 1 and 1 respectively, else if the section property is defined, then the modulus of elasticity and the moment of inertia are set to the coefficient value of the section property(i.e E*I = section.Coefficient)
    // The differential settlement is gotten from the span object: if the settlements are undefined, then the differential settlement is zero else δ = δ2 - δ1
    // To simplify the expression θ{span.supports[0].supportNo} and θ{span.supports[1].supportNo} are to be set to solvable variables, keeping reference that θ{span.supports[0].supportNo} and θ{span.supports[1].supportNo} correspond to those variables in the equations array

    if (span.supports[0].type === 'Free end' || span.supports[1].type === 'Free end') {
      return;
    }
    let differentialSettlement;
    // for settlement in span.settlements, if undefined, then set that settlement to zero, and find the differential settlement. span.settlements can be like [0.5, 0.5] or [undefined, 0.5] or [0.5, undefined] or [undefined, undefined] but not undefined
    // settlement is in mm 
    if (span.settlements[0] === undefined && span.settlements[1] === undefined) {
      differentialSettlement = 0;
    } else if (span.settlements[0] === undefined) {
      differentialSettlement = -span.settlements[1] / 1000;
    } else if (span.settlements[1] === undefined) {
      differentialSettlement = span.settlements[0] / 1000;
    } else {
      differentialSettlement = -(span.settlements[1] - span.settlements[0]) / 1000;
    }

    let E, I; // modulus of elasticity and moment of inertia
    if (span.section === undefined) {
      E = 1;
      I = 1;
    } else {
      if (span.section.YoungMod === null || span.section.Moi === null) {
        E = span.section.Coefficient;
        I = 1;
      } else {
        E = span.section.YoungMod * 1000 * span.section.Coefficient;
        I = span.section.Moi * Math.pow(10, -12);
      }
    }
    const L = span.length;
    const FEMab = fixedEndMoments.find((fem) => fem.spanNo === span.spanNo)[`FEM${span.supports[0].supportNo}${span.supports[1].supportNo}`];
    const FEMba = fixedEndMoments.find((fem) => fem.spanNo === span.spanNo)[`FEM${span.supports[1].supportNo}${span.supports[0].supportNo}`];
    const expressionMab = `${FEMab} + 2*${E}*${I}/${L} * (2*θ${span.supports[0].supportNo} + θ${span.supports[1].supportNo} - 3*${differentialSettlement}/${L})`;
    const expressionMba = `${FEMba} + 2*${E}*${I}/${L} * (2*θ${span.supports[1].supportNo} + θ${span.supports[0].supportNo} - 3*${differentialSettlement}/${L})`;
    expressionsArray.push({ spanNo: span.spanNo, Mab: expressionMab, Mba: expressionMba });
  });
  console.log("Member end moment expressions:", expressionsArray);
  return expressionsArray;
}


function eliminateKnownVariables(expressionsArray, spans) {
  // For ends fixed(for fixed end as first or last support) set θ1 and θn to be ZERO (i.e sfor the first and last expression in the array of expressions
  // if the first support is fixed, then set θ1 to zero, if the last support is fixed, then set θn to zero
  const newExpressionsArray = JSON.parse(JSON.stringify(expressionsArray));
  if (spans[0].supports[0].type === 'Fixed') {
    newExpressionsArray[0].Mab = newExpressionsArray[0].Mab.replace(`θ${spans[0].supports[0].supportNo}`, '0');
    newExpressionsArray[0].Mba = newExpressionsArray[0].Mba.replace(`θ${spans[0].supports[0].supportNo}`, '0');
  }
  if (spans[spans.length - 1].supports[1].type === 'Fixed') {
    newExpressionsArray[newExpressionsArray.length - 1].Mba = newExpressionsArray[newExpressionsArray.length - 1].Mba.replace(`θ${spans[spans.length - 1].supports[1].supportNo}`, '0');
    newExpressionsArray[newExpressionsArray.length - 1].Mab = newExpressionsArray[newExpressionsArray.length - 1].Mab.replace(`θ${spans[spans.length - 1].supports[1].supportNo}`, '0');
  }
  console.log("Eliminated known variables:", newExpressionsArray);
  return newExpressionsArray;
}


function createEquations(expressionsArray, spans, fixedEndMoments) {
  let equationsArray = [];
  // MOMENT EQUATION FOR EXTERNAL ROLLER
  // 1.) This is For the one end fixed continuous beam(i.e has one fixed end and one end that is not fixed),
  // 2.) If has an external roller or hinge support  set M12 to zero (if the roller or hinge is the first support) or M(n-1)n to zero (if the roller or hinge is the last support)
  // 3.) If has a free end as the last or first support, then set the 2nd to the last or 2nd support Moment (M(n-1)(n-2) or M21 to the negative of the FEM of the free end span) developing an equation M(n-1)(n-2) = -FEM(n-1)n or M23 = -FEM21.
  if (spans[0].supports[0].type === 'Roller' || spans[0].supports[0].type === 'Hinge') {
    equationsArray.push(expressionsArray[0].Mab + " = 0");
  }
  if (spans[spans.length - 1].supports[1].type === 'Roller' || spans[spans.length - 1].supports[1].type === 'Hinge') {
    equationsArray.push(expressionsArray[spans.length - 1].Mba + " = 0");
  }
  if (spans[0].supports[0].type === 'Free end') {
    equationsArray.push(expressionsArray[0].Mab + " = " + -fixedEndMoments.find((fem) => fem.spanNo === spans[0].spanNo)[`FEM${spans[0].supports[1].supportNo}${spans[0].supports[0].supportNo}`]);
  }
  if (spans[spans.length - 1].supports[1].type === 'Free end') {
    equationsArray.push(expressionsArray[expressionsArray.length - 1].Mba + " = " + -fixedEndMoments.find((fem) => fem.spanNo === spans[spans.length - 1].spanNo)[`FEM${spans[spans.length - 1].supports[0].supportNo}${spans[spans.length - 1].supports[1].supportNo}`]);
  }

  // MOMENT EQUATIONS FOR INTERNAL JOINT MEMBERS

  for (let i = 0; i < expressionsArray.length - 1; i++) {
    equationsArray.push(expressionsArray[i].Mba + " + " + expressionsArray[i + 1].Mab + " = 0");
  }
  console.log("Equations:", equationsArray);
  return equationsArray;
}

// To solve the linear equations in the equations array with nerdamer
// e.g nerdamer.solveEquations(['-67.5 + 2*1*1/9 * (2*θ3 + θ2 - 3*0/9) = -120', '0 + 2*1*1/6 * (2*θ2 + 0 - 3*0/6) + 67.5 + 2*1*1/9 * (2*θ2 + θ3 - 3*0/9) = 0']);
// returns [['θ2', '-41.25`] ['θ3', '-97.5']]

function solveEquations(equationsArray) {
  const newEquationsArray = JSON.parse(JSON.stringify(equationsArray));
  let solutions = nerdamer.solveEquations(newEquationsArray);
  console.log("Solutions:", solutions);
  return solutions;
}

// For each result in the solutions array, the result is an array with two elements, the first element is the variable and the second element is the value of the variable
// for each expression in each span in the expressions array, the expressions are solved by replacing the variable with the value of the variable and then solving using nerdamer({replaced expression}).evaluate().toString()
// the solved expressions are then added to the member end moment equations array for the span

function addSolutionsToExpressions(solutions, expressionsArray) {
  const newExpressionsArray = JSON.parse(JSON.stringify(expressionsArray));
  solutions.forEach((solution) => {
    for (let i = 0; i < newExpressionsArray.length; i++) {
      newExpressionsArray[i].Mab = newExpressionsArray[i].Mab.replace(solution[0], solution[1]);
      newExpressionsArray[i].Mba = newExpressionsArray[i].Mba.replace(solution[0], solution[1]);
    }
  });
  console.log("Member end moment equations with solutions:", newExpressionsArray);
  return newExpressionsArray;
}

// for each expression in the expressions array, the expressions are converted to simplified strings using nerdamer({expression}).evaluate().toString()
// the simplified expressions are then added to the member end moment equations array for the span

function simplifyExpressions(expressionsArray) {
  const newExpressionsArray = JSON.parse(JSON.stringify(expressionsArray));
  newExpressionsArray.forEach((expression) => {
    expression.Mab = nerdamer(expression.Mab).evaluate().toString();
    const fraction = expression.Mab;
    expression.Mab = nerdamer(expression.Mab);
    if (expression.Mab.denominator().toString() === '1') {
      expression.Mab = fraction + "kNm";
    } else {
      expression.Mab = fraction + " or " + parseFloat(parseFloat(expression.Mab.numerator().toString()) / parseFloat(expression.Mab.denominator().toString())).toFixed(2).toString() + "kNm";
    }

    expression.Mba = nerdamer(expression.Mba).evaluate().toString();
    const fraction2 = expression.Mba;
    expression.Mba = nerdamer(expression.Mba);
    if (expression.Mba.denominator().toString() === '1') {
      expression.Mba = fraction2 + "kNm";
    } else {
      expression.Mba = fraction2 + " or " + parseFloat(parseFloat(expression.Mba.numerator().toString()) / parseFloat(expression.Mba.denominator().toString())).toFixed(2).toString() + "kNm";
    }
  });
  console.log("Simplified member end moment equations:", newExpressionsArray);
  return newExpressionsArray;
}

// Simplified member end moment equations: 
// [{spanNo: 1, Mab: '-55/4', Mba: '-55/2'}, {spanNo: 2, Mab: '55/2', Mba: '-120'}]
// This is the final result of the member end moment equations generation, but the free end spans are not included in the result. The free end spans are not included in the result because the member end moment equations for the free end spans are not generated
// to add the member end moment equations for the free end spans, the fixed end moments for the free end spans are added to the result, if and only if the free end spans are the first or last spans in the beam

function addMemberEndMomentEquationsForFreeEndSpans(expressionsArray, fixedEndMoments, spans) {
  const newExpressionsArray = JSON.parse(JSON.stringify(expressionsArray));
  if (spans[0].supports[0].type === 'Free end') {
    newExpressionsArray.unshift({ spanNo: spans[0].spanNo, Mab: `0`, Mba: `${fixedEndMoments.find((fem) => fem.spanNo === spans[0].spanNo)[`FEM${spans[0].supports[1].supportNo}${spans[0].supports[0].supportNo}`]}` + 'kNm' });
  }
  if (spans[spans.length - 1].supports[1].type === 'Free end') {
    newExpressionsArray.push({ spanNo: spans[spans.length - 1].spanNo, Mab: `${fixedEndMoments.find((fem) => fem.spanNo === spans[spans.length - 1].spanNo)[`FEM${spans[spans.length - 1].supports[0].supportNo}${spans[spans.length - 1].supports[1].supportNo}`]}` + 'kNm', Mba: `0` });
  }
  console.log("Member end moment equations with free end spans:", newExpressionsArray);
  return newExpressionsArray;
}

// Member end moment equations with free end spans:
// [{spanNo: 1, Mab: '-55/4', Mba: '-55/2'}, {spanNo: 2, Mab: '55/2', Mba: '-120'}, {spanNo: 3, Mab: '120', Mba: '0'}]
// This is the final result of the member end moment equations generation, the member end moment equations for the free end spans are included in the result
// But I will add the span numbers to the member end moment equations for easy identification as such
// [{spanNo: 1, M12: '-55/4', M21: '-55/2'}, {spanNo: 2, M23: '55/2', M32: '-120'}, {spanNo: 3, M34: '120', M43: '0'}]

function addSpanNumbersToMemberEndMomentEquations(expressionsArray) {
  const newExpressionsArray = JSON.parse(JSON.stringify(expressionsArray));
  newExpressionsArray.forEach((expression) => {
    expression[`M${expression.spanNo}${expression.spanNo + 1}`] = expression.Mab;
    expression[`M${expression.spanNo + 1}${expression.spanNo}`] = expression.Mba;
    delete expression.Mab;
    delete expression.Mba;
  });
  console.log("Member end moment equations with span numbers:", newExpressionsArray);
  return newExpressionsArray;
}


// D I S P L A Y  F U N C T I O N S
// a function to convert the fixed end moments to a string to be inserted into a p element in the html,
function displayFixedEndMoments(fixedEndMoments) {
  let displayString = '<b class="fs-4">FIXED END MOMENTS:</b>';
  fixedEndMoments.forEach((fem) => {
    displayString += `<br><b>${fem.spanNo}:</b> FEM${fem.spanNo}${fem.spanNo + 1} = ${fem[`FEM${fem.spanNo}${fem.spanNo + 1}`]}kNm, FEM${fem.spanNo + 1}${fem.spanNo} = ${fem[`FEM${fem.spanNo + 1}${fem.spanNo}`]}kNm`;
  });
  // create a p element
  // set the innerHTML of the p element to the displayString
  const p = document.createElement('p');
  p.innerHTML = displayString;
  p.classList.add('fw-bold');
  p.classList.add('fs-5');
  // append the p element to the div with class fixed-end-moments in the html
  document.querySelector('.fixed-end-moments').appendChild(p);
  // remove the d-none class from the div with class fixed-end-moments in the html
  document.querySelector('.fixed-end-moments').classList.remove('d-none');
  return displayString;
}

// a function to convert the member end moment expressions to a string to be inserted into a p element in the html,
function displayMemberEndMomentExpressions(expressionsArray) {
  const newExpressionsArray = JSON.parse(JSON.stringify(expressionsArray));
  let displayString = '<b class="fs-4">MEMBER END MOMENT EXPRESSIONS:</b>';
  newExpressionsArray.forEach((expression) => {
    // in each expression, there exist θ1, θ2, e.t.c, change the numbers to subscripts
    expression.Mab = expression.Mab.replace(/θ(\d+)/g, 'θ<sub>$1</sub>');
    expression.Mba = expression.Mba.replace(/θ(\d+)/g, 'θ<sub>$1</sub>');
    displayString += `<br><b>${expression.spanNo}:</b> M${expression.spanNo}${expression.spanNo + 1} = ${expression.Mab}, M${expression.spanNo + 1}${expression.spanNo} = ${expression.Mba}`;
  });
  // create a p element
  // set the innerHTML of the p element to the displayString
  const p = document.createElement('p');
  p.innerHTML = displayString;
  p.classList.add('fw-bold');
  p.classList.add('fs-5');
  // append the p element to the div with class member-end-moment-equations in the html
  document.querySelector('.member-end-moment-equations').appendChild(p);
  // remove the d-none class from the div with class member-end-moment-equations in the html
  document.querySelector('.member-end-moment-equations').classList.remove('d-none');
  return displayString;
}

// A function to convert the Eliminated known variables expressions to a string to be inserted into a p element in the html,
function displayMemberEndMomentExpressionsWithEliminatedKnowns(expressionsArray) {
  const newExpressionsArray = JSON.parse(JSON.stringify(expressionsArray));
  let displayString = '<b class="fs-4">ELIMINATED KNOWN VARIABLES:</b>';
  newExpressionsArray.forEach((expression) => {
    // in each expression, there exist θ1, θ2, e.t.c, change the numbers to subscripts
    expression.Mab = expression.Mab.replace(/θ(\d+)/g, 'θ<sub>$1</sub>');
    expression.Mba = expression.Mba.replace(/θ(\d+)/g, 'θ<sub>$1</sub>');
    displayString += `<br><b>${expression.spanNo}:</b> M${expression.spanNo}${expression.spanNo + 1} = ${expression.Mab}, M${expression.spanNo + 1}${expression.spanNo} = ${expression.Mba}`;
  });
  // create a p element
  // set the innerHTML of the p element to the displayString
  const p = document.createElement('p');
  p.innerHTML = displayString;
  // add class fw-bold and fs-4 to the p element
  p.classList.add('fw-bold');
  p.classList.add('fs-5');
  // append the p element to the div with class eliminated-known-variables in the html
  document.querySelector('.eliminated-known-variables').appendChild(p);
  // remove the d-none class from the div with class eliminated-known-variables in the html
  document.querySelector('.eliminated-known-variables').classList.remove('d-none');
  return displayString;
}

// A function to convert the equations to a string to be inserted into a p element in the html,
function displayEquations(equationsArray) {
  const newEquationsArray = JSON.parse(JSON.stringify(equationsArray));
  let displayString = '<b class="fs-4">EQUATIONS:</b>';
  newEquationsArray.forEach((equation) => {
    // in each equation, there exist θ1, θ2, e.t.c, change the numbers to subscripts
    equation = equation.replace(/θ(\d+)/g, 'θ<sub>$1</sub>');
    displayString += `<br>` + equation;
  });
  // create a p element
  // set the innerHTML of the p element to the displayString
  const p = document.createElement('p');
  p.innerHTML = displayString;
  p.classList.add('fw-bold');
  p.classList.add('fs-5');
  // append the p element to the div with class equations in the html
  document.querySelector('.equations').appendChild(p);
  // remove the d-none class from the div with class equations in the html
  document.querySelector('.equations').classList.remove('d-none');
  return displayString;
}

// A function to convert the solutions to a string to be inserted into a p element in the html,
function displaySolutions(solutions) {
  let displayString = '<b class="fs-4">ROTATIONS:</b>';
  solutions.forEach((solution) => {
    // change the numbers to subscripts
    solution[0] = solution[0].replace(/θ(\d+)/g, 'θ<sub>$1</sub>');
    displayString += `<br><b>${solution[0]} = ${solution[1]}</b>`;
  });
  // create a p element
  // set the innerHTML of the p element to the displayString
  const p = document.createElement('p');
  p.innerHTML = displayString;
  p.classList.add('fs-5');
  // append the p element to the div with class solutions in the html
  document.querySelector('.rotations').appendChild(p);
  // remove the d-none class from the div with class solutions in the html
  document.querySelector('.rotations').classList.remove('d-none');
  return displayString;
}

// a function to convert the member end moments expressionsFinal to a string to be inserted into a p element in the html,
function displayMemberEndMoments(expressionsArray) {
  let displayString = '<b class="fs-4">MEMBER END MOMENTS:</b>';
  expressionsArray.forEach((expression) => {
    displayString += `<br><b>${expression.spanNo}:</b> M${expression.spanNo}${expression.spanNo + 1} = ${expression[`M${expression.spanNo}${expression.spanNo + 1}`]}, M${expression.spanNo + 1}${expression.spanNo} = ${expression[`M${expression.spanNo + 1}${expression.spanNo}`]}`;
  });
  // create a p element
  // set the innerHTML of the p element to the displayString
  const p = document.createElement('p');
  p.innerHTML = displayString;
  p.classList.add('fs-5');
  // append the p element to the div with class member-end-moments in the html
  document.querySelector('.member-end-moments').appendChild(p);
  // remove the d-none class from the div with class member-end-moments in the html
  document.querySelector('.member-end-moments').classList.remove('d-none');
  return displayString;
}