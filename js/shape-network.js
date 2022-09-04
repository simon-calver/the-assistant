
class ShapeNetwork {
  constructor(shape) {
    if (shape) {
      this.nodes = [new Node(shape)];
    } else {
      this.nodes = [];
    }
  }

  setNodes(nodes) {
    this.nodes = nodes;
  }

  remapConnections(connections) {
    let connectionsMap = Object.assign({}, ...connections.map((x, i) => ({ [x]: i })));
    // Update all connections with these values, drop any values that are not in connections
    this.nodes.forEach(function (node) {
      node.connections = node.connections.reduce(function (result, connection) {
        if (connections.includes(connection)) {
          return result.concat(connectionsMap[connection]);
        }
        return result;
      }, []);
    });

  }

  merge(nodes, connectedShapes) {
    // The connections are the index in the network, so they need to be 
    // increased for the incoming nodes
    nodes.forEach(function (node) {
      node.connections = node.connections.map(connection => connection + this.nodes.length);
    }.bind(this));
    this.nodes = this.nodes.concat(nodes);

    connectedShapes.forEach(shapes => {
      let node0 = this.getNode(shapes[0]);
      let node1 = this.getNode(shapes[1]);

      // May need these ifs?
      // if (node0) {
      node0.connections.push(this.nodes.indexOf(node1));
      // } else {
      //   // this.dropNodes()
      //   console.log('node0 undefined');
      // }
      // if (node1) {
      node1.connections.push(this.nodes.indexOf(node0));
      // } else {
      //   console.log('node1 undefined');
      // }
    });
  }

  getNode(shape) {
    for (var node of this.nodes) {
      if (node.shape == shape) {
        return node;
      }
    }
  }

  getNodeIndex(shape) {
    return this.nodes.indexOf(this.getNode(shape));
  }

  dropNodes(nodes) {
    // This is the list of all nodes ids in the new network before the ids have been transformed
    let nodesIndex = [...Array(this.nodes.length).keys()];
    let connections = nodesIndex.filter(x => !nodes.includes(x));

    // Remove the corresponding nodes
    this.nodes = this.nodes.filter(function (node, index) {
      return !nodes.includes(index);
    });

    this.remapConnections(connections);
  }

  findSubNetworks() {
    let visited = new Array(this.nodes.length).fill(false);
    let subNetworks = [];

    this.nodes.forEach(function (node, i) {
      if (!visited[i]) {
        let cluster = [i];
        this.checkConnections(node, i, visited, cluster, false);
        // Resetting the connections relies on the order being preserved, so they need to be sorted. Sort defaults to alphabetic 
        // if you don't provide a sort function!
        subNetworks.push(cluster.sort((a, b) => a - b));
      }
    }.bind(this));

    return subNetworks;
  }

  findClusters(minSize = 4, id = -1) {
    console.log('Checking for clusters');
    let visited = new Array(this.nodes.length).fill(false);
    let allClusters = [];

    this.nodes.forEach(function (node, i) {
      // Only check for specific ID, could do better than using -1?
      if (id >= 0 & node.shape.id != id) {
        return;
      }
      if (!visited[i]) {
        let cluster = [i];
        this.checkConnections(node, i, visited, cluster, true);
        if (cluster.length >= minSize) {
          allClusters.push(cluster);
        }
      }

    }.bind(this));

    return allClusters;
  }

  checkConnections(node, i, visited, cluster, checkId) {
    visited[i] = true;
    node.connections.forEach(function (nodeIndex) {
      // if (!this.nodes[nodeIndex]) {
      //   return;
      // }
      if (!visited[nodeIndex]) {
        if (checkId & node.shape.id == this.nodes[nodeIndex].shape.id) {
          cluster.push(nodeIndex);
          this.checkConnections(this.nodes[nodeIndex], nodeIndex, visited, cluster, checkId);
        } else if (!checkId) {
          cluster.push(nodeIndex);
          this.checkConnections(this.nodes[nodeIndex], nodeIndex, visited, cluster, checkId);
        }
      }
    }.bind(this));
  }
}

class Node {
  constructor(shape) {
    this.shape = shape;
    this.connections = [];
  }
}

// Uncomment this and comment the next export to run tests. This can be done properly!!
// module.exports = { Node, ShapeNetwork };
export { ShapeNetwork };
