var request = require('request');
require('dotenv').config();

var options = {
    method: 'POST',
    uri: process.env.SUBMISSION_URI,
    json: {
        source_code: "import java.io.BufferedReader;\nimport java.io.InputStreamReader;\nimport java.io.InputStream;\nimport java.io.OutputStream;\nimport java.io.Closeable;\nimport java.io.IOException;\nimport java.util.StringTokenizer;\nimport java.io.PrintWriter;\nimport java.util.ArrayList;\n\n/** Follow the prompts to input data and create your graph and then have the program display all the edges ordered by layers.\n  * created using SublimeText 3.0 at home during the first semester end holidays\n  * @author:piyuple\n  */\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        InputStream inputstream = System.in;\n        OutputStream outputstream = System.out;\n        InputReader in = new InputReader(inputstream);\n        PrintWriter out = new PrintWriter(outputstream, true);\n        Task solver = new Task();\n        solver.solve(1, in, out);\n        in.close();\n        out.close();\n    }\n\n    static class Task {\n\n        public void solve(int testnumber, InputReader in, PrintWriter out) {\n            out.println(\"Enter the data for your graph according to the following prompts :\\n\");\n            int data[] = new int[3]; //data={no of nodes, no of edges, root node}\n            String[] prompts = {\" the number of Nodes :\", \" the number of Edges :\", \" the index of the root Node in the graph :\"};\n            for(int i = 0; i < 3; i++) {\n                out.println(\"Enter\" + prompts[i]);\n                data[i] = in.nextInt();\n            }\n            //out.println(\"Nodes = \"+data[0]+\"\\nConnections = \"+data[1]+\"\\nRoot = \"+data[2]);\n\n            Node[] nodes = new Node[data[0]];\n            out.println(\"Enter the edges ( for example if Nodes 1 and 2 in the graph have aconnection, input 1 followed by 2 or vice versa) :\");\n            for(int i = 0; i < data[0]; i++) {\n                nodes[i] = new Node();\n                nodes[i].key = i + 1;\n            }\n            makeGraph(nodes, data[1], in);\n\n            ArrayList<Node>[] layer = new ArrayList[100];\n            nodes[data[2] - 1].time = 0;\n            nodes[data[2] - 1].color = 1;\n            layer[0] = new ArrayList<Node>();\n            layer[0].add(nodes[data[2] - 1]);\n\n            bfs(new Queue(new LinkedList(nodes[data[2] - 1])), layer);\n\n            for(int i = 0; i < 100; i++) {\n                if(layer[i] == null || layer[i].size() == 0) break;\n                out.print(\"\\nLayer \" + i + \" : \");\n                for(int j = 0; j < layer[i].size(); j++)\n                    out.print(layer[i].get(j).key + \" \");\n            }\n        }\n\n        public void bfs(Queue queue, ArrayList<Node>[] layer) {\n            if(queue.size == 0) return ;\n\n            Node cur = queue.poll();\n            if(layer[cur.time + 1] == null) layer[cur.time + 1] = new ArrayList<Node>();\n\n\n            for(int i = 0; i < cur.edges.size(); i++) {\n                Node child = cur.edges.get(i);\n                if(child.color != 1) {\n                    child.time = cur.time + 1;\n                    child.color = 1;\n                    layer[cur.time + 1].add(child);\n                    queue.offer(child);\n                }\n            }\n            bfs(queue, layer);\n        }\n\n        public void makeGraph(Node[] nodes, int edges, InputReader in) {\n            while(edges > 0) {\n                int x = in.nextInt() - 1, y = in.nextInt() - 1;\n                if(x >= nodes.length || x < 0 || y >= nodes.length || y < 0) {\n                    System.out.println(\"The set of edges is invalid because \"\n                        + ((x < 0 || x >= nodes.length)?\n                            ((x < 0) ? (x + 1) + \" is less  than 1.\" : (x + 1) + \" is greater than \" + nodes.length)\n                            : ((y < 0) ? (y + 1) + \" is less than 1.\" : (y + 1) + \" is greater than \" + nodes.length)));\n                    continue;\n                }\n                nodes[x].edges.add(nodes[y]);\n                nodes[y].edges.add(nodes[x]);\n                edges--;\n            }\n        }\n    }\n\n    static class LinkedList {\n        Node key;\n        LinkedList prev, next;\n\n        public LinkedList(Node key) {\n            this.key = key;\n            prev = next = null;\n        }\n    }\n\n    static class Queue {\n        int size;\n        LinkedList list, index;\n\n        public Queue(LinkedList list) {\n            this.list = this.index = list;\n            size = 1;\n        }\n\n        public Queue() {\n            this.list = null;\n            size = 0;\n        }\n\n        public void offer(Node x) {\n            if(list == null) {\n                list = index = new LinkedList(x);\n            }\n            else {\n                list.prev = new LinkedList(x);\n                list.prev.next = list;\n                list = list.prev;\n            }\n            size++;\n        }\n\n        public Node poll() {\n            if(size != 0) {\n                Node key = index.key;\n                if(size == 1) index = list = null;\n                else {\n                    index = index.prev;\n                    index.next = null;\n                }\n                size--;\n                return key;\n            }\n            return null;\n        }\n    }\n\n    static class Node {\n        int key, color, time;\n        ArrayList<Node> edges;\n\n        public Node() {\n            edges = new ArrayList<>();\n            key = -1;\n            color = time = 0;\n        }\n    }\n\n    static class InputReader implements Closeable {\n        public BufferedReader in;\n        public StringTokenizer str;\n\n        public InputReader(InputStream IN) {\n            this.in = new BufferedReader(new InputStreamReader(IN), 32768);\n            str = null;\n        }\n\n        public String next() {\n            while(str == null || !str.hasMoreTokens()) {\n                try {\n                    str = new StringTokenizer(in.readLine());\n                }\n                catch(IOException e) {\n                    throw  new RuntimeException(e);\n                }\n            }\n            return str.nextToken();\n        }\n\n        public String nextLine() {\n            String s;\n            try {\n                s = in.readLine();\n            }\n            catch(IOException e) {\n                throw new RuntimeException(e);\n            }\n            return s;\n        }\n\n        public int nextInt() {\n            return Integer.parseInt(next());\n        }\n\n        public long nextLong() {\n            return Long.parseLong(next());\n        }\n\n        public void close() throws IOException {\n            in.close();\n            str = null;\n        }\n    }\n}\n",
        language_id: process.env.LANGUAGE_ID,
        stdin: "5\n4\n1\n1 2\n1 5\n3 4\n4 1"
    },
    headers: {
        'Content-type': 'application/json'
    }
}, token = null, result = null;

console.log("source: \n" + options.json.source_code);


function callAPI() {
    console.log("calling external API");
    request(options, function (error, response, body) {
        console.log("response received");


        if (!error && response.statusCode == 201) {
            token = body.token;
            console.log(body);

            getSub();

        } else {
            console.log("DURING CALLING EXTERNAL API FOR TOKEN");
            console.log("Error: " + error + "\nResponse: " + JSON.stringify(response));
        }
    });
}


function getSub(msg) {
    console.log("querying external API with token");
    request(options.uri + "/" + token, function (err, res, bdy) {
            console.log("response received");
            if (!err && res.statusCode == 200) {
                result = JSON.parse(bdy);

                if (msg)
                    console.log("output: \n" + result.stdout);
                else
                    console.log("body:\n" + bdy);

            } else {
                console.log("DURING QUERYING EXTERNAL API WITH TOKEN");
                console.log("Error: " + err + "\nResponse: " + JSON.stringify(res));
            }
        });
}

callAPI();
setTimeout(getSub, 15000, true);
