const fs = require("fs");
const net = require("net");

const init = async () => {
  const existFile = await fs.existsSync("hosts.txt");
  if (existFile) {
    console.log("file alredy exists ");
  } else {
    console.log("creating file...");
    await fs.appendFileSync("hosts.txt", "");
    console.log("file created!");
  }

  createSocket();
};

const setConnectionFile = (string) => {
  fs.appendFile('hosts.txt', string, () => {}) 
}


/* 
{
  method: SET | GET
  hostname: string
  port: number
}
*/

const createSocket = async () => {
  const server = net.createServer(function(connection) { 
    console.log('client connected');

    connection.on('end', function() {
       console.log('client disconnected');
    });

    connection.on('data', (data) => {
      setConnectionFile(data.toString())
    })
    
    connection.write('Hello World!\r\n');
    connection.pipe(connection);
 });
 
 server.listen(1234, function() { 
    console.log('server is listening');
 });


 server.on('error', (err) => console.log(err))

 
};

init();
