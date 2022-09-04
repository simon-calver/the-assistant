// Uncomment this and comment the next export to run tests. This can be done properly!!
const { Node, ShapeNetwork } = require('../js/shape-network.js');
// import { ShapeNetwork } from '../js/shape-cluster.js';

class Shape {
  constructor(id) {
    this.id = id;
  }
}

describe('ShapeNetwork', () => {
  test('Merge networks', () => {
    let shape0 = new Shape(0);
    let shape1 = new Shape(1);

    let shapeNetwork0 = new ShapeNetwork(shape0);
    let shapeNetwork1 = new ShapeNetwork(shape1);

    shapeNetwork0.merge(shapeNetwork1.nodes, [[shape0, shape1]]);

    expect(shapeNetwork0.nodes[0].connections.length).toEqual(1);
    expect(shapeNetwork0.nodes[0].connections).toMatchObject([1]);

    let shape2 = new Shape(1);

    let shapeNetwork2 = new ShapeNetwork(shape2);

    shapeNetwork0.merge(shapeNetwork2.nodes, [[shape1, shape2]]);

    expect(shapeNetwork0.nodes[0].connections.length).toEqual(1);
    expect(shapeNetwork0.nodes[1].connections.length).toEqual(2);

    expect(shapeNetwork0.nodes[1].connections).toMatchObject([0, 2]);
  });

  test('Find clusters', () => {
    let shape0 = new Shape(0);
    let shape1 = new Shape(0);
    let shape2 = new Shape(0);
    let shape3 = new Shape(0);
    let shape4 = new Shape(1);
    let shape5 = new Shape(1);
    let shape6 = new Shape(1);
    let shape7 = new Shape(1);
    let shape8 = new Shape(1);
    let shape9 = new Shape(1);

    let node0 = new Node(shape0);
    let node1 = new Node(shape1);
    let node2 = new Node(shape2);
    let node3 = new Node(shape3);
    let node4 = new Node(shape4);
    let node5 = new Node(shape5);
    let node6 = new Node(shape6);
    let node7 = new Node(shape7);
    let node8 = new Node(shape8);
    let node9 = new Node(shape9);

    node0.connections = [1, 5];
    node1.connections = [0, 2];
    node2.connections = [1, 3, 6];
    node3.connections = [2, 4, 7];
    node4.connections = [3];
    node5.connections = [0];
    node6.connections = [2, 7, 8];
    node7.connections = [3, 6, 9];
    node8.connections = [6, 9];
    node9.connections = [7, 8];

    // Network diagram
    // 0(0) -- 1(0) -- 2(0) -- 3(0) -- 4(1)
    // |               |       |
    // 5(1)            6(1) -- 7(1)
    //                 |       |
    //                 8(1) -- 9(1)

    let shapeNetwork = new ShapeNetwork();
    shapeNetwork.setNodes([node0, node1, node2, node3, node4, node5, node6, node7, node8, node9]);

    let clusters = shapeNetwork.findClusters();

    expect(clusters[0].sort()).toMatchObject([0, 1, 2, 3]);
    expect(clusters[1].sort()).toMatchObject([6, 7, 8, 9]);
  });

  test('Drop nodes', () => {
    let shape0 = new Shape(0);
    let shape1 = new Shape(0);
    let shape2 = new Shape(0);
    let shape3 = new Shape(0);
    let shape4 = new Shape(1);
    let shape5 = new Shape(1);
    let shape6 = new Shape(1);
    let shape7 = new Shape(1);
    let shape8 = new Shape(1);
    let shape9 = new Shape(1);

    let node0 = new Node(shape0);
    let node1 = new Node(shape1);
    let node2 = new Node(shape2);
    let node3 = new Node(shape3);
    let node4 = new Node(shape4);
    let node5 = new Node(shape5);
    let node6 = new Node(shape6);
    let node7 = new Node(shape7);
    let node8 = new Node(shape8);
    let node9 = new Node(shape9);

    node0.connections = [1, 5];
    node1.connections = [0, 2];
    node2.connections = [1, 3, 6];
    node3.connections = [2, 4, 7];
    node4.connections = [3];
    node5.connections = [0];
    node6.connections = [2, 7, 8];
    node7.connections = [3, 6, 9];
    node8.connections = [6, 9];
    node9.connections = [7, 8];

    // Network diagram
    // 0(0) -- 1(0) -- 2(0) -- 3(0) -- 4(1)
    // |               |       |
    // 5(1)            6(1) -- 7(1)
    //                 |       |
    //                 8(1) -- 9(1)

    let shapeNetwork = new ShapeNetwork();
    shapeNetwork.setNodes([node0, node1, node2, node3, node4, node5, node6, node7, node8, node9]);

    shapeNetwork.dropNodes([2, 3]);

    // New network  
    // 0(0) -- 1(0)                     2(1)
    // |                       
    // 3(1)            4(1) -- 5(1)
    //                 |       |
    //                 6(1) -- 7(1)

    expect(shapeNetwork.nodes.length).toEqual(8);

    expect(shapeNetwork.nodes[4].connections.sort()).toMatchObject([5, 6]);
    expect(shapeNetwork.nodes[0].connections.sort()).toMatchObject([1, 3]);
  });

  test('Find sub networks', () => {
    let shape0 = new Shape(0);
    let shape1 = new Shape(0);
    let shape2 = new Shape(0);
    let shape3 = new Shape(0);
    let shape4 = new Shape(1);
    let shape5 = new Shape(1);
    let shape6 = new Shape(1);
    let shape7 = new Shape(1);
    let shape8 = new Shape(1);
    let shape9 = new Shape(1);

    let node0 = new Node(shape0);
    let node1 = new Node(shape1);
    let node2 = new Node(shape2);
    let node3 = new Node(shape3);
    let node4 = new Node(shape4);
    let node5 = new Node(shape5);
    let node6 = new Node(shape6);
    let node7 = new Node(shape7);
    let node8 = new Node(shape8);
    let node9 = new Node(shape9);

    node0.connections = [1, 5];
    node1.connections = [0, 2];
    node2.connections = [1];
    node3.connections = [4, 7];
    node4.connections = [3];
    node5.connections = [0];
    node6.connections = [7, 8];
    node7.connections = [3, 6, 9];
    node8.connections = [6, 9];
    node9.connections = [7, 8];

    // Network diagram
    // 0(0) -- 1(0) -- 2(0)    3(0) -- 4(1)
    // |                       |
    // 5(1)            6(1) -- 7(1)
    //                 |       |
    //                 8(1) -- 9(1)

    let shapeNetwork = new ShapeNetwork();
    shapeNetwork.setNodes([node0, node1, node2, node3, node4, node5, node6, node7, node8, node9]);

    let subNetworks = shapeNetwork.findSubNetworks();

    expect(subNetworks.length).toEqual(2);

    expect(subNetworks[0].sort()).toMatchObject([0, 1, 2, 5]);
    expect(subNetworks[1].sort()).toMatchObject([3, 4, 6, 7, 8, 9]);
  });

  test('Remap connections', () => {
    let shape0 = new Shape(0);
    let shape1 = new Shape(0);
    let shape2 = new Shape(0);
    let shape3 = new Shape(0);

    let node0 = new Node(shape0);
    let node1 = new Node(shape1);
    let node2 = new Node(shape2);
    let node3 = new Node(shape3);

    node0.connections = [3, 8];
    node1.connections = [0, 5];
    node2.connections = [3];
    node3.connections = [0];

    // Network diagram
    // 0(0) -- 1(3) -- 2(5)   
    // |                      
    // 3(8)           

    let shapeNetwork = new ShapeNetwork();
    shapeNetwork.setNodes([node0, node1, node2, node3]);

    shapeNetwork.remapConnections();

    expect(shapeNetwork.nodes[0].connections).toMatchObject([1, 3]);
    expect(shapeNetwork.nodes[1].connections).toMatchObject([0, 2]);
    expect(shapeNetwork.nodes[2].connections).toMatchObject([1]);
    expect(shapeNetwork.nodes[3].connections).toMatchObject([0]);
  });
});
