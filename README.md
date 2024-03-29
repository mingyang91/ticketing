# How to run
## Prerequisites
docker and docker-compose are required.
```
$ docker-compose up
```
## DDL
Run this to initialize the database.
```
$ npx prisma migrate deploy
```
## Generate fake data
```
$ curl localhost:8000/api/fake-data-fill
```
## Run
You need to change `items[].productId` to the real UUID we generated in the previous command.
The `orderId` UUID in URL path is randomly generated by the client to ensure idempotent.
```
$ curl --location --request PUT 'localhost:8000/api/purchase/9836e6dc-27ed-442f-9e49-b84fe5f8f7ce' \
--header 'Content-Type: application/json' \
--data-raw '{
    "creditCardInfo": {
        "number": "376237924510443",
        "expireDate": "08/25",
        "CVC": "666"
    },
    "items": [{
        "productId": "1f32f40e-83a7-4b03-9448-7ad04c0445bc",
        "quantity": 10000
    }]
}'
```