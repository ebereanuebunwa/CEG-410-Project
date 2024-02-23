// AUTHOR: Kadiri Victor

// This module contains the functions that will be used to collect and validate the data from the input fields

// import the calculations module
import * as calculationsModule from './calculations.js';

// Global variables
let beamLength;
let supports = []; // array of objects
let sections = []; // array of objects
let settlements = []; // array of numbers
let pointLoads = []; // array of objects
let distributedLoads = []; // array of objects
let moments = []; // array of objects
let noOfSpans; // integer

// Getting the menu buttons

// menu buttons
const beamButton = document.getElementById("beam-button");
const supportButton = document.getElementById("support-button");
const sectionButton = document.getElementById("section-button");
const settlementButton = document.getElementById("settlement-button");
const plButton = document.getElementById("pl-button");
const dlButton = document.getElementById("dl-button");
const mButton = document.getElementById("m-button");
// back button
const backButton = document.getElementById("back-button");
// add button
const addButton = document.getElementById("add-button");
// takeback button
const takebackButton = document.getElementById("takeback-button");


// E V E N T   L I S T E N E R S
// Adding event listeners to the buttons

// menu buttons
beamButton.addEventListener("click", function () {
    document.querySelector(".menu-buttons").classList.add("d-none");
    document.querySelector(".menu-inputs").classList.remove("d-none");
    document.querySelector("[element-type='Beam']").classList.remove("d-none");
    // add d-none to the takeback button id takeback-button
    document.getElementById("takeback-button").classList.add("d-none");
});

supportButton.addEventListener("click", function () {
    document.querySelector(".menu-buttons").classList.add("d-none");
    document.querySelector(".menu-inputs").classList.remove("d-none");
    document.querySelector("[element-type='Support']").classList.remove("d-none");
    // add d-none to the takeback button id takeback-button
    document.getElementById("takeback-button").classList.add("d-none");
});

sectionButton.addEventListener("click", function () {
    document.querySelector(".menu-buttons").classList.add("d-none");
    document.querySelector(".menu-inputs").classList.remove("d-none");
    document.querySelector("[element-type='Section']").classList.remove("d-none");
    // remove d-none from the takeback button id takeback-button
    document.getElementById("takeback-button").classList.remove("d-none");
});

settlementButton.addEventListener("click", function () {
    document.querySelector(".menu-buttons").classList.add("d-none");
    document.querySelector(".menu-inputs").classList.remove("d-none");
    document.querySelector("[element-type='Settlement']").classList.remove("d-none");
    // remove d-none from the takeback button id takeback-button
    document.getElementById("takeback-button").classList.remove("d-none");
});

plButton.addEventListener("click", function () {
    document.querySelector(".menu-buttons").classList.add("d-none");
    document.querySelector(".menu-inputs").classList.remove("d-none");
    document.querySelector("[element-type='Point Load']").classList.remove("d-none");
    // remove d-none from the takeback button id takeback-button
    document.getElementById("takeback-button").classList.remove("d-none");
});

dlButton.addEventListener("click", function () {
    document.querySelector(".menu-buttons").classList.add("d-none");
    document.querySelector(".menu-inputs").classList.remove("d-none");
    document.querySelector("[element-type='Distributed Load']").classList.remove("d-none");
    // remove d-none from the takeback button id takeback-button
    document.getElementById("takeback-button").classList.remove("d-none");
});

mButton.addEventListener("click", function () {
    document.querySelector(".menu-buttons").classList.add("d-none");
    document.querySelector(".menu-inputs").classList.remove("d-none");
    document.querySelector("[element-type='Moments']").classList.remove("d-none");
    // remove d-none from the takeback button id takeback-button
    document.getElementById("takeback-button").classList.remove("d-none");
});

// back button
// add an event listener to the back button that will add the d-none class to either of the element-type classes without the d-none class and remove the d-none class from the menu-buttons class
backButton.addEventListener("click", function () {
    document.querySelector(".menu-buttons").classList.remove("d-none");
    document.querySelector(".menu-inputs").classList.add("d-none");
    document.querySelector(".menu-input-inputs > div:not(.d-none)").classList.add("d-none");
});

// add event listeners to the buttons with ids roller hinge and fixed, when clicked the class active is added to the button clicked and removed from the other buttons
const rollerButton = document.getElementById("roller");
const hingeButton = document.getElementById("hinge");
const fixedButton = document.getElementById("fixed");

rollerButton.addEventListener("click", function () {
    rollerButton.classList.add("active");
    hingeButton.classList.remove("active");
    fixedButton.classList.remove("active");
    // remove the error element added in the collectSupportData function
    if (document.querySelector("#support-input > p") != null) {
        document.querySelector("#support-input > p").remove();
    }
}
);

hingeButton.addEventListener("click", function () {
    rollerButton.classList.remove("active");
    hingeButton.classList.add("active");
    fixedButton.classList.remove("active");
    // remove the error element added in the collectSupportData function
    if (document.querySelector("#support-input > p") != null) {
        document.querySelector("#support-input > p").remove();
    }
}
);

fixedButton.addEventListener("click", function () {
    rollerButton.classList.remove("active");
    hingeButton.classList.remove("active");
    fixedButton.classList.add("active");
    // remove the error element added in the collectSupportData function
    if (document.querySelector("#support-input > p") != null) {
        document.querySelector("#support-input > p").remove();
    }
}
);

// add event listeners to the buttons with ids l-support, m-support and r-support, when clicked the class active is added to the button clicked and removed from the other buttons
const lSupportButton = document.getElementById("l-support");
const mSupportButton = document.getElementById("m-support");
const rSupportButton = document.getElementById("r-support");

lSupportButton.addEventListener("click", function () {
    lSupportButton.classList.add("active");
    mSupportButton.classList.remove("active");
    rSupportButton.classList.remove("active");
    // get the element with id support-location-form and change the value of the input field with id support-location-input to 0
    document.getElementById("support-location-form").value = 0;

    // remove the error element added in the collectSupportData function, but only if the p element is the last child of the div with the id support-input
    if (document.querySelector("#support-input > p:last-child") != null) {
        document.querySelector("#support-input > p:last-child").remove();
    }
});

mSupportButton.addEventListener("click", function () {
    lSupportButton.classList.remove("active");
    mSupportButton.classList.add("active");
    rSupportButton.classList.remove("active");

    // get the element with id support-location-form and change the value of the input field with id support-location-input to beamLength/2
    document.getElementById("support-location-form").value = beamLength / 2;

    if (document.querySelector("#support-input > p:last-child") != null) {
        document.querySelector("#support-input > p:last-child").remove();
    }

});

rSupportButton.addEventListener("click", function () {
    lSupportButton.classList.remove("active");
    mSupportButton.classList.remove("active");
    rSupportButton.classList.add("active");

    // get the element with id support-location-form and change the value of the input field with id support-location-input to beamLength
    document.getElementById("support-location-form").value = beamLength;

    if (document.querySelector("#support-input > p:last-child") != null) {
        document.querySelector("#support-input > p:last-child").remove();
    }

});

// add event listeners to the buttons with ids pl-l, pl-m and pl-r, when clicked the class active is added to the button clicked and removed from the other buttons
const plLButton = document.getElementById("pl-l");
const plMButton = document.getElementById("pl-m");
const plRButton = document.getElementById("pl-r");

plLButton.addEventListener("click", function () {
    plLButton.classList.add("active");
    plMButton.classList.remove("active");
    plRButton.classList.remove("active");
    // get the element with id pl-location-form and change the value of the input field with id pl-location-input to 0
    document.getElementById("pl-location-form").value = 0;
});

plMButton.addEventListener("click", function () {
    plLButton.classList.remove("active");
    plMButton.classList.add("active");
    plRButton.classList.remove("active");

    // get the element with id pl-location-form and change the value of the input field with id pl-location-input to beamLength/2
    document.getElementById("pl-location-form").value = beamLength / 2;
});

plRButton.addEventListener("click", function () {
    plLButton.classList.remove("active");
    plMButton.classList.remove("active");
    plRButton.classList.add("active");

    // get the element with id pl-location-form and change the value of the input field with id pl-location-input to beamLength
    document.getElementById("pl-location-form").value = beamLength;
});

// add event listeners to the buttons with ids dl-l and dl-r, when the button dl-l is clicked, fill the input field with id dlStart with 0 and when the button dl-r is clicked, fill the input field with id dlEnd with the value of the input field with id beamLength
const dlLButton = document.getElementById("dl-l");
const dlRButton = document.getElementById("dl-r");


dlLButton.addEventListener("click", function () {
    document.getElementById("dlStart").value = 0;
});

dlRButton.addEventListener("click", function () {
    document.getElementById("dlEnd").value = beamLength;
});

// add event listeners to the buttons with ids m-l, m-m and m-r, when clicked the class active is added to the button clicked and removed from the other buttons
const mLButton = document.getElementById("m-l");
const mMButton = document.getElementById("m-m");
const mRButton = document.getElementById("m-r");

mLButton.addEventListener("click", function () {
    mLButton.classList.add("active");
    mMButton.classList.remove("active");
    mRButton.classList.remove("active");
    // get the element with id m-position-form and change the value of the input field with id m-location-input to 0
    document.getElementById("m-position-form").value = 0;
});

mMButton.addEventListener("click", function () {
    mLButton.classList.remove("active");
    mMButton.classList.add("active");

    mRButton.classList.remove("active");
    // get the element with id m-position-form and change the value of the input field with id m-location-input to beamLength/2
    document.getElementById("m-position-form").value = beamLength / 2;
});

mRButton.addEventListener("click", function () {
    mLButton.classList.remove("active");
    mMButton.classList.remove("active");
    mRButton.classList.add("active");

    // get the element with id m-position-form and change the value of the input field with id m-location-input to beamLength
    document.getElementById("m-position-form").value = beamLength;
});

// add event listeners to the solve button id solve, when clicked, call the exportParameters function 
const solveButton = document.getElementById("solve");

solveButton.addEventListener("click", function () {
    document.querySelector(".visualizer").classList.add("d-none");



    // disable the solve button
    solveButton.setAttribute("disabled", "");
    // remove the disabled attribute from the buttons with ids move-left and move-right
    document.getElementById("move-left").removeAttribute("disabled");
    // change the innerhtml of the span with id mode to "Mode: solutions"
    document.getElementById("mode").innerHTML = "Mode: solutions";

    // call and catch an errors that may occur in the exportParameters function, by adding a p element with the text "an Error Occurred! Please try again" as the last child of the div with the class display
    try {
        exportParameters();
    } catch (error) {
        const errorElement = document.createElement("p");
        errorElement.innerHTML = "an Error Occurred! Please Hit reset and try again";
        errorElement.classList.add('fw-bold');
        errorElement.classList.add('fs-6');
        errorElement.classList.add('mt-3');
        document.querySelector(".display").appendChild(errorElement);
    }
});

// add event listeners to the buttons with ids move-left and move-right,
// when the button move-left is clicked, remove the disabled attribute from the move-right button and add the disabled attribute to the move-left button. add the d-none class to the divs with the classes fixed-end-moments, member-end-moment-equations, eliminated-known-variables, equations, rotations, member-end-moments
const moveLeftButton = document.getElementById("move-left");
const moveRightButton = document.getElementById("move-right");

moveLeftButton.addEventListener("click", function () {
    moveRightButton.removeAttribute("disabled");
    moveLeftButton.setAttribute("disabled", "");
    document.querySelector(".fixed-end-moments").classList.add("d-none");
    document.querySelector(".member-end-moment-equations").classList.add("d-none");
    document.querySelector(".eliminated-known-variables").classList.add("d-none");
    document.querySelector(".equations").classList.add("d-none");
    document.querySelector(".rotations").classList.add("d-none");
    document.querySelector(".member-end-moments").classList.add("d-none");
    // remove the d-none class from the div with the class visualizer
    document.querySelector(".visualizer").classList.remove("d-none");

    document.getElementById("mode").innerHTML = "Mode: parameters";
});

// when the button move-right is clicked, remove the disabled attribute from the move-left button and add the disabled attribute to the move-right button. remove the d-none class from the divs with the classes fixed-end-moments, member-end-moment-equations, eliminated-known-variables, equations, rotations, member-end-moments
moveRightButton.addEventListener("click", function () {
    moveLeftButton.removeAttribute("disabled");
    moveRightButton.setAttribute("disabled", "");
    document.querySelector(".fixed-end-moments").classList.remove("d-none");
    document.querySelector(".member-end-moment-equations").classList.remove("d-none");
    document.querySelector(".eliminated-known-variables").classList.remove("d-none");
    document.querySelector(".equations").classList.remove("d-none");
    document.querySelector(".rotations").classList.remove("d-none");
    document.querySelector(".member-end-moments").classList.remove("d-none");
    // add the d-none class to the div with the class visualizer
    document.querySelector(".visualizer").classList.add("d-none");

    document.getElementById("mode").innerHTML = "Mode: solutions";
});

// add event listeners to the button with id reset, when clicked, reload the page
const resetButton = document.getElementById("reset");

resetButton.addEventListener("click", function () {
    location.reload();
});

// button "takeback" to take back any action done by the add button or the enter key
// the takeback button functions similarly to the add button and the enter key, but instead of adding the data to the arrays, it removes the last element added to the arrays and updates the visualizer with the new data
// for the section, it removes the last section and updates the visualizer. also changes the value of the innerHTML of the span with id spanNo to the length of the sections array + 1
// for the settlement, it removes the last settlement and updates the visualizer. also changes the value of the innerHTML of the span with id supportNo to the length of the settlements array + 1
// for the point load, it removes the last point load and updates the visualizer. also changes the value of the innerHTML of the span with id plNo to the length of the pointLoads array + 1
// for the distributed load, it removes the last distributed load and updates the visualizer. also changes the value of the innerHTML of the span with id dlNo to the length of the distributedLoads array + 1
// for the moments, it removes the last moment and updates the visualizer. also changes the value of the innerHTML of the span with id mNo to the length of the moments array + 1

takebackButton.addEventListener("click", function () {
    if (document.querySelector(".menu-input-inputs > div:not(.d-none)") != null) {
        if (document.querySelector(".menu-input-inputs > div:not(.d-none)").getAttribute("element-type") == "Section") {
            sections.pop();
            visualizeParameters();
            document.getElementById("spanNo").innerHTML = sections.length + 1;
            // remove the disabled attribute and the is-valid class of the Moi and YoungMod input field if the value of the innerHTML of the span with id spanNo equals 1
            if (sections.length < 1) {
                document.getElementById("MoiInput").removeAttribute("disabled");
                document.getElementById("YoungModInput").removeAttribute("disabled");
                document.getElementById("MoiInput").classList.remove("is-valid");
                document.getElementById("YoungModInput").classList.remove("is-valid");
            }
            // also remove the is-valid class of the FlexRig input field if it has it
            document.getElementById("FlexRigInput").classList.remove("is-valid");
            // remove the value of the input field with the id FlexRigInput
            document.getElementById("FlexRigInput").value = "";
        }
        if (document.querySelector(".menu-input-inputs > div:not(.d-none)").getAttribute("element-type") == "Settlement") {
            settlements.pop();
            visualizeParameters();
            document.getElementById("supportNo").innerHTML = settlements.length + 1;
            // remove the is-valid class of the settlement input field
            document.getElementById("settlementInput").classList.remove("is-valid");
        }
        if (document.querySelector(".menu-input-inputs > div:not(.d-none)").getAttribute("element-type") == "Point Load") {
            pointLoads.pop();
            visualizeParameters();
            document.getElementById("plNo").innerHTML = pointLoads.length + 1;
        }
        if (document.querySelector(".menu-input-inputs > div:not(.d-none)").getAttribute("element-type") == "Distributed Load") {
            distributedLoads.pop();
            visualizeParameters();
            document.getElementById("dlNo").innerHTML = distributedLoads.length + 1;
        }
        if (document.querySelector(".menu-input-inputs > div:not(.d-none)").getAttribute("element-type") == "Moments") {
            moments.pop();
            visualizeParameters();
            document.getElementById("mNo").innerHTML = moments.length + 1;
        }
    }
});

// Adding event listeners to the add button and the enter key check the element-type class without the d-none class and call the collectData function for the element-type class without the d-none class
addButton.addEventListener("click", function () {
    if (document.querySelector(".menu-input-inputs > div:not(.d-none)") != null) {
        if (document.querySelector(".menu-input-inputs > div:not(.d-none)").getAttribute("element-type") == "Beam") {
            beamLength = collectBeamData();
            visualizeParameters();
        }
        if (document.querySelector(".menu-input-inputs > div:not(.d-none)").getAttribute("element-type") == "Support") {
            const support = collectSupportData();
            // check the supports array if a support exists with the same location and if it does, add an error element similar to the one in the collectData function but with text "a support already exists at this location!" and it should be added as the last child of the div with the id support-input else add the support to the supports array
            if (support == -1) {
                return;
            }
            if (supports != null) {
                for (let i = 0; i < supports.length; i++) {
                    if (supports[i].location == support.location) {
                        if (document.querySelector("#support-input > p:last-child") == null) {
                            const error = document.createElement("p");
                            error.innerHTML = "a support already exists at this location!";
                            error.classList.add("error-text");
                            const addDiv = document.querySelector("#support-input");
                            addDiv.appendChild(error);
                        }
                        return;
                    }
                }
            }
            supports[supports.length] = support;
            visualizeParameters();
            // change the value of the innerHTML of the span with id supportSupportNo to the length of the supports array + 1
            document.getElementById("supportSupportNo").innerHTML = supports.length + 1;
            // check if the lsupport, msupport and rsupport buttons have the class active and if any is, remove the class active from the button
            if (document.getElementById("l-support").classList.contains("active")) {
                document.getElementById("l-support").classList.remove("active");
            }
            if (document.getElementById("m-support").classList.contains("active")) {
                document.getElementById("m-support").classList.remove("active");
            }
            if (document.getElementById("r-support").classList.contains("active")) {
                document.getElementById("r-support").classList.remove("active");
            }
            // clear the input field with the id support-location-form
            document.getElementById("support-location-form").value = "";
            // check if the no of supports is greater than 2 and if it is, check if at least one support is a fixed support if there is, remove the disabled attribute from the section and settlement buttons
            if (supports.length > 2) {
                document.getElementById("section-button").removeAttribute("disabled");
                document.getElementById("settlement-button").removeAttribute("disabled");
                noOfSpans = calculateNoOfSpans();
            }
            console.log(settlements);
            console.log(supports);
            console.log(supports.length);
        }

        if (document.querySelector(".menu-input-inputs > div:not(.d-none)").getAttribute("element-type") == "Section") {
            collectSectionData();
            visualizeParameters();
        }
        if (document.querySelector(".menu-input-inputs > div:not(.d-none)").getAttribute("element-type") == "Settlement") {
            collectSettlementData();
            visualizeParameters();
        }
        if (document.querySelector(".menu-input-inputs > div:not(.d-none)").getAttribute("element-type") == "Point Load") {
            collectPointLoadData();
            visualizeParameters();
        }
        if (document.querySelector(".menu-input-inputs > div:not(.d-none)").getAttribute("element-type") == "Distributed Load") {
            collectDistributedLoadData();
            visualizeParameters();
        }
        if (document.querySelector(".menu-input-inputs > div:not(.d-none)").getAttribute("element-type") == "Moments") {
            collectMomentData();
            visualizeParameters();
        }
    }
});

// add an event listener to the enter key
document.addEventListener("keydown", function (event) {
    if (event.key == "Enter") {
        if (document.querySelector(".menu-input-inputs > div:not(.d-none)") != null) {
            if (document.querySelector(".menu-input-inputs > div:not(.d-none)").getAttribute("element-type") == "Beam") {
                beamLength = collectBeamData();
                visualizeParameters();
            }
            if (document.querySelector(".menu-input-inputs > div:not(.d-none)").getAttribute("element-type") == "Support") {
                const support = collectSupportData();
                // check the supports array if a support exists with the same location and if it does, add an error element similar to the one in the collectData function but with text "a support already exists at this location!" and it should be added as the last child of the div with the id support-input else add the support to the supports array
                if (support == -1) {
                    return;
                }
                if (supports != null) {
                    for (let i = 0; i < supports.length; i++) {
                        if (supports[i].location == support.location) {
                            if (document.querySelector("#support-input > p:last-child") == null) {
                                const error = document.createElement("p");
                                error.innerHTML = "a support already exists at this location!";
                                error.classList.add("error-text");
                                const addDiv = document.querySelector("#support-input");
                                addDiv.appendChild(error);
                            }
                            return;
                        }
                    }
                }
                supports[supports.length] = support;
                visualizeParameters();
                // change the value of the innerHTML of the span with id supportSupportNo to the length of the supports array + 1
                document.getElementById("supportSupportNo").innerHTML = supports.length + 1;
                // check if the lsupport, msupport and rsupport buttons have the class active and if any is, remove the class active from the button
                if (document.getElementById("l-support").classList.contains("active")) {
                    document.getElementById("l-support").classList.remove("active");
                }
                if (document.getElementById("m-support").classList.contains("active")) {
                    document.getElementById("m-support").classList.remove("active");
                }
                if (document.getElementById("r-support").classList.contains("active")) {
                    document.getElementById("r-support").classList.remove("active");
                }
                // clear the input field with the id support-location-form
                document.getElementById("support-location-form").value = "";
                // check if the no of supports is greater than 2 and if it is, check if at least one support is a fixed support if there is, remove the disabled attribute from the section and settlement buttons
                if (supports.length > 2) {
                    document.getElementById("section-button").removeAttribute("disabled");
                    document.getElementById("settlement-button").removeAttribute("disabled");
                    noOfSpans = calculateNoOfSpans();
                }
                console.log(settlements);
                console.log(supports);
                console.log(supports.length);
            }

            if (document.querySelector(".menu-input-inputs > div:not(.d-none)").getAttribute("element-type") == "Section") {
                collectSectionData();
                visualizeParameters();
            }
            if (document.querySelector(".menu-input-inputs > div:not(.d-none)").getAttribute("element-type") == "Settlement") {
                collectSettlementData();
                visualizeParameters();
            }
            if (document.querySelector(".menu-input-inputs > div:not(.d-none)").getAttribute("element-type") == "Point Load") {
                collectPointLoadData();
                visualizeParameters();
            }
            if (document.querySelector(".menu-input-inputs > div:not(.d-none)").getAttribute("element-type") == "Distributed Load") {
                collectDistributedLoadData();
                visualizeParameters();
            }
            if (document.querySelector(".menu-input-inputs > div:not(.d-none)").getAttribute("element-type") == "Moments") {
                collectMomentData();
                visualizeParameters();
            }
        }
    }
});



// D A T A   C O L L E C T I O N  A N D   V A L I D A T I O N

// beam data collection and validation
function collectBeamData() {
    // getting the value from the input field with id beamLengthInput and removing the white spaces
    const beamLen = document.getElementById("beamLengthInput").value.trim();
    // validate if it's an integer or float and if it's greater than 0
    if (beamLen == "" || isNaN(beamLen) || beamLen <= 0) {
        // make the input field red
        document.getElementById("beamLengthInput").classList.add("is-invalid");
        // create a p element containing the text "verify the highlighted input fields!" and add it to the div with the class 'add-on' as first child
        addErrorElement();
        disableButtons('beam');
        return -1;
    } else {
        // make the input field green
        document.getElementById("beamLengthInput").classList.remove("is-invalid");
        document.getElementById("beamLengthInput").classList.add("is-valid");
        // disable the input field
        document.getElementById("beamLengthInput").setAttribute("disabled", "");
        // remove the error element
        if (document.querySelector(".add-on > p") != null) {
            document.querySelector(".add-on > p").remove();
        }
        console.log(parseFloat(beamLen));
        unDisableButtons('beam');
        return parseFloat(beamLen);
    }
}

// support data collection and validation
function collectSupportData() {
    let supportType = null;
    let supportLocation = null;
    // check the button in the div with id support-type with the class active and get the value of the button from the element-value attribute and if no button is active, add an error element similar to the one in the collectBeamData function but with text "select a support type!" and it should be added as the third child of the div with the id support-input
    if (document.querySelector("#support-type > button.active") != null) {
        supportType = document.querySelector("#support-type > button.active").getAttribute("element-value");
        console.log(supportType);
    } else {
        if (document.querySelector("#support-input > p") == null) {
            const error = document.createElement("p");
            error.innerHTML = "select a support type!";
            // add class inline-block to the error element
            error.classList.add("error-text");
            const addDiv = document.querySelector("#support-input");
            addDiv.insertBefore(error, addDiv.childNodes[2]);
        }
    }
    // check the element with id support-location-form for it's value, trim it and if its not a number or greater than the beam Length, add an error element similar to the one in the collectBeamData function but with text "select a valid support position!" and it should be added as the last child of the div with the id support-input, note that the error should be added even if the error element with the text "select a support type!" is present
    if (document.getElementById("support-location-form").value.trim() != "" && !isNaN(document.getElementById("support-location-form").value.trim()) && document.getElementById("support-location-form").value.trim() <= beamLength) {
        supportLocation = document.getElementById("support-location-form").value.trim();
        // remove the error element added in the collectSupportData function
        if (document.querySelector("#support-input > p:last-child") != null) {
            document.querySelector("#support-input > p:last-child").remove();
        }
    } else {
        if (document.querySelector("#support-input > p:last-child") == null) {
            const error = document.createElement("p");
            error.innerHTML = "select a valid support position!";
            // add class inline-block to the error element
            error.classList.add("error-text");
            const addDiv = document.querySelector("#support-input");
            addDiv.appendChild(error);
        }
    }
    // if the support type and support location are valid, create an object with the properties type and location and return the object
    if (supportType != null && supportLocation != null) {
        const support = {
            supportNo: supports.length + 1,
            type: supportType,
            location: parseFloat(supportLocation)
        }
        return support;
    } else {
        return -1;
    }
}

// section data collection and validation
function collectSectionData() {
    let section;
    if (sections.length < noOfSpans) {
        console.log('debug');
        // get the value from the input field with id MoiInput, if it is not a number or less than 0, call the addErrorElement function and return -1. if the input field is empty it is valid
        const Moi = document.getElementById("MoiInput").value.trim();
        if (Moi != "" && (isNaN(Moi) || Moi < 0)) {
            document.getElementById("MoiInput").classList.add("is-invalid");
            addErrorElement();
            return -1;
        } else {
            document.getElementById("MoiInput").classList.remove("is-invalid");
            document.getElementById("MoiInput").classList.add("is-valid");
            // remove the error element
            if (document.querySelector(".add-on > p") != null) {
                document.querySelector(".add-on > p").remove();
            }
        }
        //  get the value from the input field with id YoungModInput, if it is not a number or less than 0, call the addErrorElement function and return -1. if the input field is empty it is valid
        const YoungMod = document.getElementById("YoungModInput").value.trim();
        if (YoungMod != "" && (isNaN(YoungMod) || YoungMod < 0)) {
            document.getElementById("YoungModInput").classList.add("is-invalid");
            addErrorElement();
            return -1;
        } else {
            document.getElementById("YoungModInput").classList.remove("is-invalid");
            document.getElementById("YoungModInput").classList.add("is-valid");
            // remove the error element
            if (document.querySelector(".add-on > p") != null) {
                document.querySelector(".add-on > p").remove();
            }
        }
        //  get the value from the input field with id FlexRigInput, if it is empty or it is not a number or less than 0, call the addErrorElement function and return -1. it must not be empty
        const FlexRig = document.getElementById("FlexRigInput").value.trim();
        if (FlexRig == "" || isNaN(FlexRig) || FlexRig < 0) {
            document.getElementById("FlexRigInput").classList.add("is-invalid");
            addErrorElement();
            return -1;
        } else {
            document.getElementById("FlexRigInput").classList.remove("is-invalid");
            document.getElementById("FlexRigInput").classList.add("is-valid");
            // remove the error element
            if (document.querySelector(".add-on > p") != null) {
                document.querySelector(".add-on > p").remove();
            }
        }
        // first check if the sections array is empty and if it isn't, the current section will inherit the Moi and YoungMod values of the last section in the sections array
        // if the input fields are valid, create an object with the properties Moi, YoungMod and FlexRig and add it to the sections array. if either the Moi or YoungMod input fields are empty, add the value 0 to the sections array
        if (sections.length == 0) {
            section = {
                Moi: Moi == "" ? null : parseFloat(Moi),
                YoungMod: YoungMod == "" ? null : parseFloat(YoungMod),
                Coefficient: parseFloat(FlexRig)
            }
            // add the disabled attribute the Moi and YoungMod input fields
            document.getElementById("MoiInput").setAttribute("disabled", "");
            document.getElementById("YoungModInput").setAttribute("disabled", "");
        } else {
            section = {
                Moi: sections[sections.length - 1].Moi,
                YoungMod: sections[sections.length - 1].YoungMod,
                Coefficient: parseFloat(FlexRig)
            }
        }
        sections[sections.length] = section;
        // change the value of the innerHTML of the span with id spanNo to the length of the sections array + 1 only if sections.length is less than noOfSpans
        if (sections.length < noOfSpans) {
            document.getElementById("spanNo").innerHTML = sections.length + 1;
            // clear the input field with the id FlexRigInput
            document.getElementById("FlexRigInput").value = "";
            // remove the valid class from the input field with the id FlexRigInput
            document.getElementById("FlexRigInput").classList.remove("is-valid");
        }
        console.log(sections);

    }
}

// settlement data collection and validation
function collectSettlementData() {
    if (settlements.length < supports.length) {
        console.log('debug');
        // get the value from the input field with id settlementInput, if it is either empty or not a number or less than zero, call the addErrorElement function and return -1
        const settlement = document.getElementById("settlementInput").value.trim();
        if (settlement == "" || isNaN(settlement) || parseFloat(settlement) < 0) {
            document.getElementById("settlementInput").classList.add("is-invalid");
            addErrorElement();
            return -1;
        } else {
            document.getElementById("settlementInput").classList.remove("is-invalid");
            document.getElementById("settlementInput").classList.add("is-valid");
            // remove the error element
            if (document.querySelector(".add-on > p") != null) {
                document.querySelector(".add-on > p").remove();
            }
        }
        // if the input field is valid, add the value to the settlements array
        settlements[settlements.length] = parseFloat(settlement);
        // change the value of the innerHTML of the span with id supportNo to the length of the settlements array + 1
        if (settlements.length < supports.length) {
            document.getElementById("supportNo").innerHTML = settlements.length + 1;
            // clear the input field with the id settlementInput
            document.getElementById("settlementInput").value = "";
            // remove the valid class from the input field with the id settlementInput
            document.getElementById("settlementInput").classList.remove("is-valid");
        }
        console.log(settlements);
    }
}

// function to collect the point load data
function collectPointLoadData() {
    // get the value from the input field with id pl-location-form, if it is not a number or less than 0 or greater than the beam length, call the addErrorElement function and return -1
    const plLocation = document.getElementById("pl-location-form").value.trim();
    if (plLocation == "" || isNaN(plLocation) || parseFloat(plLocation) < 0 || parseFloat(plLocation) > beamLength) {
        document.getElementById("pl-location-form").classList.add("is-invalid");
        addErrorElement();
        return -1;
    } else {
        document.getElementById("pl-location-form").classList.remove("is-invalid");
        document.getElementById("pl-location-form").classList.add("is-valid");
        // remove the error element
        if (document.querySelector(".add-on > p") != null) {
            document.querySelector(".add-on > p").remove();
        }
    }
    // get the value from the input field with id pl-magnitude-form, if it is not a number, call the addErrorElement function and return -1
    const plMagnitude = document.getElementById("pl-magnitude-form").value.trim();
    if (plMagnitude == "" || isNaN(plMagnitude) || parseFloat(plMagnitude) < 0) {
        document.getElementById("pl-magnitude-form").classList.add("is-invalid");
        addErrorElement();
        return -1;
    } else {
        document.getElementById("pl-magnitude-form").classList.remove("is-invalid");
        document.getElementById("pl-magnitude-form").classList.add("is-valid");
        // remove the error element
        if (document.querySelector(".add-on > p") != null) {
            document.querySelector(".add-on > p").remove();
        }
    }
    // if the input fields are valid, create an object with the properties location and magnitude and add it to the pointLoads array
    const pointLoad = {
        location: parseFloat(plLocation),
        magnitude: parseFloat(plMagnitude)
    }
    pointLoads[pointLoads.length] = pointLoad;
    // change the value of the innerHTML of the span with id plNo to the length of the pointLoads array + 1
    document.getElementById("plNo").innerHTML = pointLoads.length + 1;
    // clear the input fields with the id pl-location-form and pl-magnitude-form

    document.getElementById("pl-location-form").value = "";
    document.getElementById("pl-magnitude-form").value = "";
    // remove the valid class from the input fields with the id pl-location-form and pl-magnitude-form
    document.getElementById("pl-location-form").classList.remove("is-valid");
    document.getElementById("pl-magnitude-form").classList.remove("is-valid");
    console.log(pointLoads);
}

// function to collect the distributed load data
function collectDistributedLoadData() {
    // get the value from the input fields with dlStart, dlEnd, dlStartMag and dlEndMag, if any of the input fields are empty or not a number, call the addErrorElement function and return -1. For the input fields with ids dlStart and dlEnd, if the value is less than 0 or greater than the beam length, call the addErrorElement function and return -1
    const dlStart = document.getElementById("dlStart").value.trim();
    const dlEnd = document.getElementById("dlEnd").value.trim();
    const dlStartMag = document.getElementById("dlStartMag").value.trim();
    const dlEndMag = document.getElementById("dlEndMag").value.trim();

    // check if dlStart is less than dlEnd and if it is not, call the addErrorElement function and return -1. compare the values as numbers
    if (parseFloat(dlStart) > parseFloat(dlEnd)) {
        document.getElementById("dlStart").classList.add("is-invalid");
        document.getElementById("dlEnd").classList.add("is-invalid");
        addErrorElement();
        return -1;
    } else {
        document.getElementById("dlStart").classList.remove("is-invalid");
        document.getElementById("dlStart").classList.add("is-valid");
        document.getElementById("dlEnd").classList.remove("is-invalid");
        document.getElementById("dlEnd").classList.add("is-valid");
        // remove the error element
        if (document.querySelector(".add-on > p") != null) {
            document.querySelector(".add-on > p").remove();
        }
    }

    if (dlStart == "" || isNaN(dlStart) || parseFloat(dlStart) < 0 || parseFloat(dlStart) > beamLength) {
        document.getElementById("dlStart").classList.add("is-invalid");
        addErrorElement();
        return -1;
    } else {
        document.getElementById("dlStart").classList.remove("is-invalid");
        document.getElementById("dlStart").classList.add("is-valid");
        // remove the error element
        if (document.querySelector(".add-on > p") != null) {
            document.querySelector(".add-on > p").remove();
        }
    }

    if (dlEnd == "" || isNaN(dlEnd) || parseFloat(dlEnd) < 0 || parseFloat(dlEnd) > beamLength) {
        document.getElementById("dlEnd").classList.add("is-invalid");
        addErrorElement();
        return -1;
    } else {
        document.getElementById("dlEnd").classList.remove("is-invalid");
        document.getElementById("dlEnd").classList.add("is-valid");
        // remove the error element
        if (document.querySelector(".add-on > p") != null) {
            document.querySelector(".add-on > p").remove();
        }
    }

    if (dlStartMag == "" || isNaN(dlStartMag) || parseFloat(dlStartMag) < 0) {
        document.getElementById("dlStartMag").classList.add("is-invalid");
        addErrorElement();
        return -1;
    } else {
        document.getElementById("dlStartMag").classList.remove("is-invalid");
        document.getElementById("dlStartMag").classList.add("is-valid");
        // remove the error element
        if (document.querySelector(".add-on > p") != null) {
            document.querySelector(".add-on > p").remove();
        }
    }

    if (dlEndMag == "" || isNaN(dlEndMag) || parseFloat(dlEndMag) < 0) {
        document.getElementById("dlEndMag").classList.add("is-invalid");
        addErrorElement();
        return -1;
    } else {
        document.getElementById("dlEndMag").classList.remove("is-invalid");
        document.getElementById("dlEndMag").classList.add("is-valid");
        // remove the error element
        if (document.querySelector(".add-on > p") != null) {
            document.querySelector(".add-on > p").remove();
        }
    }
    // if the input fields are valid, create an object with the properties start, end, startMag and endMag and add it to the distributedLoads array
    const distributedLoad = {
        start: parseFloat(dlStart),
        end: parseFloat(dlEnd),
        startMag: parseFloat(dlStartMag),
        endMag: parseFloat(dlEndMag)
    }
    distributedLoads[distributedLoads.length] = distributedLoad;
    // change the value of the innerHTML of the span with id dlNo to the length of the distributedLoads array + 1
    document.getElementById("dlNo").innerHTML = distributedLoads.length + 1;
    // clear the input fields with the id dlStart, dlEnd, dlStartMag and dlEndMag
    document.getElementById("dlStart").value = "";
    document.getElementById("dlEnd").value = "";
    document.getElementById("dlStartMag").value = "";
    document.getElementById("dlEndMag").value = "";
    // remove the valid class from the input fields with the id dlStart, dlEnd, dlStartMag and dlEndMag
    document.getElementById("dlStart").classList.remove("is-valid");
    document.getElementById("dlEnd").classList.remove("is-valid");
    document.getElementById("dlStartMag").classList.remove("is-valid");
    document.getElementById("dlEndMag").classList.remove("is-valid");
    console.log(distributedLoads);
}

// function to collect the moment data
function collectMomentData() {
    // get the value from the input field with id m-position-form, if it is not a number or less than 0 or greater than the beam length, call the addErrorElement function and return -1
    const mPosition = document.getElementById("m-position-form").value.trim();
    if (mPosition == "" || isNaN(mPosition) || parseFloat(mPosition) < 0 || parseFloat(mPosition) > beamLength) {
        document.getElementById("m-position-form").classList.add("is-invalid");
        addErrorElement();
        return -1;
    } else {
        document.getElementById("m-position-form").classList.remove("is-invalid");
        document.getElementById("m-position-form").classList.add("is-valid");
        // remove the error element
        if (document.querySelector(".add-on > p") != null) {
            document.querySelector(".add-on > p").remove();
        }
    }
    // get the value from the input field with id m-magnitude-form, if it is not a number, call the addErrorElement function and return -1
    const mMagnitude = document.getElementById("m-magnitude-form").value.trim();
    if (mMagnitude == "" || isNaN(mMagnitude)) {
        document.getElementById("m-magnitude-form").classList.add("is-invalid");
        addErrorElement();
        return -1;
    } else {
        document.getElementById("m-magnitude-form").classList.remove("is-invalid");
        document.getElementById("m-magnitude-form").classList.add("is-valid");
        // remove the error element
        if (document.querySelector(".add-on > p") != null) {
            document.querySelector(".add-on > p").remove();
        }
    }
    // if the input fields are valid, create an object with the properties position and magnitude and add it to the moments array
    const moment = {
        position: parseFloat(mPosition),
        magnitude: parseFloat(mMagnitude)
    }
    moments[moments.length] = moment;
    // change the value of the innerHTML of the span with id mNo to the length of the moments array + 1
    document.getElementById("mNo").innerHTML = moments.length + 1;
    // clear the input fields with the id m-position-form and m-magnitude-form
    document.getElementById("m-position-form").value = "";
    document.getElementById("m-magnitude-form").value = "";
    // remove the valid class from the input fields with the id m-position-form and m-magnitude-form
    document.getElementById("m-position-form").classList.remove("is-valid");
    document.getElementById("m-magnitude-form").classList.remove("is-valid");
    console.log(moments);
}
// M I S C E L L A N E O U S  F U N C T I O N S

// function to remove the disabled attribute from the buttons
function unDisableButtons(elementType) {
    if (elementType == 'beam') {
        document.getElementById("support-button").removeAttribute("disabled");
        document.getElementById("pl-button").removeAttribute("disabled");
        document.getElementById("dl-button").removeAttribute("disabled");
        document.getElementById("m-button").removeAttribute("disabled");
    }
}

// function to add the disabled attribute to the buttons
function disableButtons(elementType) {
    if (elementType == 'beam') {
        document.getElementById("support-button").setAttribute("disabled", "");
        document.getElementById("pl-button").setAttribute("disabled", "");
        document.getElementById("dl-button").setAttribute("disabled", "");
        document.getElementById("m-button").setAttribute("disabled", "");
    }
}

// function to add the error element to the div with the class 'add-on' as done in the collectData function
function addErrorElement() {
    if (document.querySelector(".add-on > p") == null) {
        const error = document.createElement("p");
        error.innerHTML = "verify the highlighted input fields!";
        // add class inline-block to the error element
        error.classList.add("d-inline-block");
        error.classList.add("error-text");
        const addDiv = document.querySelector(".add-on");
        addDiv.insertBefore(error, addDiv.firstChild);
    }
}

// function to calculate the no of spans, accounting for the fact that a span might have only one support if there are no supports at the ends of the beam
function calculateNoOfSpans() {
    let noOfSpans = 0;
    // sort the supports array in ascending order of location
    supports.sort(function (a, b) {
        return a.location - b.location;
    });
    // calculate the no of spans and store in the variable noOfSpans
    noOfSpans = supports[0].location == 0 ? noOfSpans : noOfSpans + 1;
    noOfSpans = supports[supports.length - 1].location == beamLength ? noOfSpans : noOfSpans + 1;
    noOfSpans = noOfSpans + supports.length - 1;
    console.log(noOfSpans);
    return noOfSpans;
}

// function to export the global variables to another file
function exportParameters() {
    calculationsModule.setParameters({
        beamLength,
        supports,
        sections,
        settlements,
        pointLoads,
        distributedLoads,
        moments,
        noOfSpans,
    });
}

// V I S U A L I Z A T I O N   F U N C T I O N S

// function to converts the global variables to a string to be inserted into a p element and added to the div with the class visualizer, first remove all the children of the div with the class visualizer if any, then create a p element and add the string to the p element and add the p element to the div with the class visualizer
function visualizeParameters() {
    const visualizer = document.querySelector(".visualizer");
    while (visualizer.firstChild) {
        visualizer.removeChild(visualizer.firstChild);
    }
    let parameters = `>> <b class="fs-4">Beam Length:</b> ${beamLength}m`;
    parameters += "<br>";
    parameters += `<br>>> <b class="fs-4">Supports:</b> `;
    parameters += "<br>";
    // sort the supports array in ascending order of location
    supports.sort(function (a, b) {
        return a.location - b.location;
    });
    for (let i = 0; i < supports.length; i++) {
        parameters += `Support ${i + 1}: ${supports[i].type} at ${supports[i].location}m`;
        parameters += "<br>";
    }
    
    parameters += `<br>>> <b class="fs-4">Sections:</b> `;
    parameters += "<br>";
    for (let i = 0; i < sections.length; i++) {
        parameters += `Section ${i + 1}: Moi: ${sections[i].Moi}mm<sup>4</sup>, Young Modulus: ${sections[i].YoungMod}MPa, Coefficient: ${sections[i].Coefficient}`;
        parameters += "<br>";
    }
    parameters += `<br>>> <b class="fs-4">Settlements:</b> `;
    parameters += "<br>";
    for (let i = 0; i < settlements.length; i++) {
        parameters += `Settlement at Support${i + 1}: ${settlements[i]}mm`;
        parameters += "<br>";
    }
    parameters += `<br>>> <b class="fs-4">Point Loads:</b> `;
    parameters += "<br>";
    for (let i = 0; i < pointLoads.length; i++) {
        parameters += `Point Load ${i + 1}: ${pointLoads[i].magnitude}KN at ${pointLoads[i].location}m`;
        parameters += "<br>";
    }
    parameters += `<br>>> <b class="fs-4">Distributed Loads:</b> `;
    parameters += "<br>";
    for (let i = 0; i < distributedLoads.length; i++) {
        parameters += `Distributed Load ${i + 1}: ${distributedLoads[i].startMag}KN to ${distributedLoads[i].endMag}KN from ${distributedLoads[i].start}m to ${distributedLoads[i].end}m`;
        parameters += "<br>";
    }
    parameters += `<br>>> <b class="fs-4">Moments:</b> `;
    parameters += "<br>";
    for (let i = 0; i < moments.length; i++) {
        parameters += `Moment ${i + 1}: ${moments[i].magnitude}KNm at ${moments[i].position}m`;
        parameters += "<br>";
    }
    const p = document.createElement("p");
    p.innerHTML = parameters;
    visualizer.appendChild(p);
}