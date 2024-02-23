import { Member } from "../classes/member";
import { Node } from "../classes/node";
import * as tf from "@tensorflow/tfjs";
import { inv, multiply } from "mathjs";

interface INode {
  x: number;
  type: "fixed" | "hinge" | "roller";
}

interface PointLoad {
  magnitude: number;
  position: number;
}

interface UniformlyDistributedLoad {
  magnitude: number;
  startEnd: number[];
}

function det(m: {
  shape: [any, any];
  as1D: () => any;
  gather: (arg0: tf.Tensor1D) => any;
}) {
  return tf.tidy(() => {
    const [r, _] = m.shape;
    if (r === 2) {
      const t = m.as1D();
      const a = t.slice([0], [1]).dataSync()[0];
      const b = t.slice([1], [1]).dataSync()[0];
      const c = t.slice([2], [1]).dataSync()[0];
      const d = t.slice([3], [1]).dataSync()[0];
      const result = a * d - b * c;
      return result;
    } else {
      let s = 0;
      const rows = [...Array(r).keys()];
      for (let i = 0; i < r; i++) {
        const sub_m = m.gather(
          tf.tensor1d(
            rows.filter((e) => e !== i),
            "int32"
          )
        );
        const sli = sub_m.slice([0, 1], [r - 1, r - 1]);
        s += Math.pow(-1, i) * det(sli);
      }
      return s;
    }
  });
}

const invertMatrix = (m: any): any => {
  return inv(m);
};

const getRotations = async (members: Member[]) => {
  if (members.length == 1) {
    const c = members[0].ei / members[0].length;
    if (
      members[0].startNode.supportType == "fixed" &&
      members[0].endNode.supportType == "fixed"
    ) {
      members[0].startNode.rotation = 0;
      members[0].endNode.rotation = 0;
      return members;
    } else if (members[0].startNode.supportType == "fixed") {
      members[0].startNode.rotation = 0;
      members[0].endNode.rotation = -members[0].femFarNear / (2 * c);
      return members;
    } else if (members[0].endNode.supportType == "fixed") {
      members[0].startNode.rotation = -members[0].femNearFar / (2 * c);
      members[0].endNode.rotation = 0;
      return members;
    }

    const coeff_matrix = (await tf
      .tensor([
        [
          members[0].startNode.rotationCoefficient * 2 * c,
          members[0].endNode.rotationCoefficient * c,
        ],
        [
          members[0].startNode.rotationCoefficient * c,
          members[0].endNode.rotationCoefficient * 2 * c,
        ],
      ])
      .array()) as number[][];
    const res_matrix = (await tf
      .tensor([[-members[0].femNearFar], [-members[0].femFarNear]])
      .array()) as number[][];
    const results = multiply(
      invertMatrix(coeff_matrix)!,
      res_matrix
    ) as unknown as number[][];
    members[0].startNode.rotation = results[0][0];
    members[0].endNode.rotation = results[1][0];

    return members;
  } else {
    if (
      members[0].startNode.supportType == "fixed" ||
      members[members.length - 1].endNode.supportType == "fixed"
    ) {
      if (members[0].startNode.supportType == "fixed") {
        members[0].startNode.rotation = 0;
        if (members[members.length - 1].endNode.supportType == "fixed") {
          members[members.length - 1].endNode.rotation = 0;
          const matrix = (await tf
            .zeros([members.length - 1, members.length - 1])
            .array()) as number[][];
          const res_matrix = (await tf
            .zeros([members.length - 1, 1])
            .array()) as number[][];

          for (let i = 0; i < members.length; i++) {
            const member = members[i];
            const c = member.ei / member.length;

            if (i == 0) {
              matrix[i][i] += member.endNode.rotationCoefficient * 2 * c;
              res_matrix[i][0] += -member.femFarNear;
            }

            if (i == members.length - 1) {
              matrix[i - 1][i - 1] +=
                member.startNode.rotationCoefficient * 2 * c;
              res_matrix[i - 1][0] += -member.femNearFar;
            }
            if (i != 0 && i != members.length - 1) {
              matrix[i - 1][i - 1] +=
                member.startNode.rotationCoefficient * 2 * c;
              matrix[i - 1][i] += member.endNode.rotationCoefficient * c;
              matrix[i][i - 1] += member.startNode.rotationCoefficient * c;
              matrix[i][i] = member.endNode.rotationCoefficient * 2 * c;
              res_matrix[i - 1][0] += -member.femNearFar;
              res_matrix[i][0] += -member.femFarNear;
            }
          }

          const results = multiply(
            invertMatrix(matrix)!,
            res_matrix
          ) as unknown as number[][];

          for (let i = 0; i < members.length; i++) {
            if (i == 0 || i == members.length - 1) continue;

            members[i].startNode.rotation = results[i - 1][0];
            members[i].endNode.rotation = results[i][0];
          }
        } else {
          const matrix = (await tf
            .zeros([members.length, members.length])
            .array()) as number[][];
          const res_matrix = (await tf
            .zeros([members.length, 1])
            .array()) as number[][];

          for (let i = 0; i < members.length; i++) {
            const member = members[i];
            const c = member.ei / member.length;

            if (i == 0) {
              matrix[i][i] += member.endNode.rotationCoefficient * 2 * c;
              res_matrix[i][0] += -member.femFarNear;
            }

            if (i != 0) {
              matrix[i][i] += member.startNode.rotationCoefficient * 2 * c;
              matrix[i][i - 1] += member.endNode.rotationCoefficient * c;
              matrix[i - 1][i] += member.startNode.rotationCoefficient * c;
              matrix[i - 1][i - 1] +=
                member.endNode.rotationCoefficient * 2 * c;
              res_matrix[i][0] += -member.femNearFar;
            }
          }

          const results = multiply(
            invertMatrix(matrix)!,
            res_matrix
          ) as unknown as number[][];

          for (let i = 0; i < members.length; i++) {
            if (i == 0) continue;
            members[i].startNode.rotation = results[0][i];
            members[i].endNode.rotation = results[0][i - 1];
          }
        }
      } else {
        members[members.length - 1].endNode.rotation = 0;
        const matrix = (await tf
          .zeros([members.length, members.length])
          .array()) as number[][];

        const res_matrix = (await tf
          .zeros([members.length, 1])
          .array()) as number[][];

        for (let i = 0; i < members.length; i++) {
          const member = members[i];
          const c = member.ei / member.length;

          if (i == members.length - 1) {
            matrix[i - 1][i - 1] +=
              member.startNode.rotationCoefficient * 2 * c;
            res_matrix[i - 1][0] += -member.femNearFar;
          }

          if (i != 0) {
            matrix[i][i] += member.startNode.rotationCoefficient * 2 * c;
            matrix[i][i - 1] += member.endNode.rotationCoefficient * c;
            matrix[i - 1][i] += member.startNode.rotationCoefficient * c;
            matrix[i - 1][i - 1] += member.endNode.rotationCoefficient * 2 * c;
            res_matrix[i][0] += -member.femNearFar;
          }
        }

        const results = multiply(
          invertMatrix(matrix)!,
          res_matrix
        ) as unknown as number[][];

        for (let i = 0; i < members.length; i++) {
          if (i == members.length - 1) continue;
          if (i == 0) {
            members[i].endNode.rotation = results[members.length - 1][0];
          } else {
            members[i].endNode.rotation = results[i - 1][0];
          }
          members[i].startNode.rotation = results[i][0];
        }
      }
      return members;
    }

    const matrix = (await tf
      .zeros([members.length + 1, members.length + 1])
      .array()) as number[][];
    const res_matrix = (await tf
      .zeros([members.length + 1, 1])
      .array()) as number[][];
    for (let m = 0; m < members.length; m++) {
      const member = members[m];
      const c = member.ei / member.length;
      matrix[m][m] += member.startNode.rotationCoefficient * 2 * c;
      matrix[m][m + 1] += member.endNode.rotationCoefficient * c;
      matrix[m + 1][m] += member.startNode.rotationCoefficient * c;
      matrix[m + 1][m + 1] += member.endNode.rotationCoefficient * 2 * c;
      res_matrix[m][0] += -member.femNearFar;
      res_matrix[m + 1][0] += -member.femFarNear;
    }

    const results = multiply(
      invertMatrix(matrix)!,
      res_matrix
    ) as unknown as number[][];
    for (let i = 0; i < members.length; i++) {
      members[i].startNode.rotation = results[i][0];
      members[i].endNode.rotation = results[i + 1][0];
    }
    return members;
  }
};

export async function POST(request: Request) {
  const body = await request.json();
  const { nodes, pointLoads, udls } = body as {
    nodes: INode[];
    pointLoads: PointLoad[];
    udls: UniformlyDistributedLoad[];
  };
  const n_members = nodes.length - 1;
  const members = [];
  if (!nodes.length) return Response.json({ error: "No nodes found" });
  if (nodes.some((node) => !Number.isFinite(node.x)))
    return Response.json({ error: "Invalid x" });
  if (nodes.some((node) => !node.type))
    return Response.json({ error: "Invalid type" });
  if (
    nodes.some(
      (node) =>
        node.type !== "fixed" && node.type !== "hinge" && node.type !== "roller"
    )
  )
    return Response.json({ error: "Invalid type" });
  if (
    nodes.some(
      (node, i) => !(i == 0 || i == nodes.length - 1) && node.type == "fixed"
    )
  )
    return Response.json({ error: "Fixed end can't occur in the middle" });
  const _nodes = nodes.map((node) => new Node(node.x, node.type));
  for (let index = 0; index < n_members; index++) {
    members.push(
      new Member(
        nodes[index + 1].x - nodes[index].x,
        _nodes[index],
        _nodes[index + 1],
        1
      )
    );
  }

  for (let i = 0; i < members.length; i++) {
    const start = members[i].start;
    const end = members[i].end;
    const length = members[i].length;
    const member = members[i];

    for (let j = 0; j < pointLoads.length; j++) {
      const load = pointLoads[j];
      if (start <= load.position && load.position <= end) {
        const a = load.position - start;
        const b = end - load.position;
        const loadValue = load.magnitude;
        member.femNearFar -= (loadValue * b ** 2 * a) / length ** 2;
        member.femFarNear += (loadValue * a ** 2 * b) / length ** 2;
      }
    }

    for (let j = 0; j < udls.length; j++) {
      const load = udls[j];
      if (load.startEnd[0] <= start && load.startEnd[1] >= end) {
        const loadValue = load.magnitude;
        member.femNearFar -= (loadValue * length ** 2) / 12;
        member.femFarNear += (loadValue * length ** 2) / 12;
      } else if (load.startEnd[0] <= start && load.startEnd[1] < end) {
        const l = load.startEnd[1] - start;
        const loadValue = load.magnitude;
        member.femNearFar -=
          (loadValue *
            l ** 2 *
            (3 * l ** 2 - 8 * l * length + 6 * length ** 2)) /
          (12 * length ** 2);
        member.femFarNear +=
          (loadValue * l ** 3 * (4 * length - 3 * l)) / (12 * length ** 2);
      } else if (load.startEnd[0] > start && load.startEnd[1] >= end) {
        const l = end - load.startEnd[0];
        const loadValue = load.magnitude;
        member.femFarNear -=
          (loadValue *
            l ** 2 *
            (3 * l ** 2 - 8 * l * length + 6 * length ** 2)) /
          (12 * length ** 2);
        member.femNearFar +=
          (loadValue * l ** 3 * (4 * length - 3 * l)) / (12 * length ** 2);
      } else if (load.startEnd[0] > start && load.startEnd[1] < end) {
        const l1 = load.startEnd[1] - start;
        const l2 = end - load.startEnd[0];
        const loadValue = load.magnitude;
        member.femNearFar -=
          (loadValue *
            l1 ** 2 *
            (3 * l1 ** 2 - 8 * l1 * length + 6 * length ** 2)) /
            (12 * length ** 2) +
          (loadValue * l2 ** 3 * (4 * length - 3 * l2)) / (12 * length ** 2) -
          (loadValue * length ** 2) / 12;
        member.femFarNear +=
          (loadValue * l1 ** 3 * (4 * length - 3 * l1)) / (12 * length ** 2) +
          (loadValue *
            l2 ** 2 *
            (3 * l2 ** 2 - 8 * l2 * length + 6 * length ** 2)) /
            (12 * length ** 2) -
          (loadValue * length ** 2) / 12;
      }
    }
  }

  const membersE = await getRotations(members);
  return Response.json({
    members: membersE,
    res: membersE.map((m) => m.toString),
  });
}
