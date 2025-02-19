const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
  switch (event.routeKey) {
    case "GET /record":
      const params = {
        TableName: "my_iot_db",
      };

      dynamo.scan(params, (err, result) => {
        if (err) {
          console.error(
            "Unable to scan the table. Error:",
            JSON.stringify(err, null, 2)
          );
          return callback(null, {
            statusCode: 500,
            body: JSON.stringify({ message: "Error retrieving records" }),
          });
        }

        return callback(null, {
          statusCode: 200,
          body: JSON.stringify(result.Items),
        });
      });
      break;

    default:
      return callback(null, {
        statusCode: 400,
        body: JSON.stringify({
          message: "Unsupported route: " + event.routeKey,
        }),
      });
  }
};
