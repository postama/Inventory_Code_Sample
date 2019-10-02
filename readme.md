# Inventory Service

## Summary

The Inventory Service is a Event Sourced service that takes commands - validates them, saves them as events, and publishes those events on an SNS bus

## Development
### Development Environment
#### Testing
The inventory service has 100% test coverage. This is currently not enforced by a CI server. Jest (https://jestjs.io/) is used for testing, coverage, and mocking. To run tests run
```
npm test
```

To run coverage run
```
npm run coverage
```

To lint run
```
npm run lint
```
#### Running
To run the inventory service offline run
```
docker-compose up
npm run start_serverless
```
On first time start up the dynamodb tables must be created. Run
```
sls dynamodb migrate
```

Note that running it offline supports the service, running on `localhost:3000` but events are not published to the SNS bus, so anything in the Inventory Projections service will not be updated.

The docker container comes with a dynamo shell which can be accessed at `localhost:8000` and a dynamo manager which can be accessed at `localhost:8001`

### Adding an event
The most common deveopment task will likey be adding a command handler / event type. It is recommended to copy an existing similar command handler, but there are a couple 'gotcha' points.
 - Add the event type to `event-types.ts`. This is a repository of all the possible event types, and ensures that an event that is not specified here is not saved
 - Add the reducer to the entity file in the `repo` directory. For example `repo/inventory/inventory.ts`. This registers the reducer so that when `getById` is called, it knows how to handle the new event. This is a violation of the Open/Closed principal, if there is better way to do this in TypeScript while maintiating code-splitting, please implement.
 - The command hanlder also has to be added to `serverless.yml` to be deployed.


## Deployment

To deploy the inventory service to the dev stage run
```
npm run deploy_dev
```

To deploy the inventory service to the prod stage run
```
npm run deploy_prod
```

These commands just run 
```
sls deploy --stage=STAGE
```
But with a higher memory so webpack doesn't fail during the compile process.

## Design
### Application Design
The Inventory Service is 100% event sourced and employs CQRS. That means the current state of an inventory item is not saved in dynamo, only the events. For more information on Event Sourcing I recommend https://www.youtube.com/watch?v=JHGkaShoyNs

#### Command Handlers
Each lambda of the inventory service is composed of a few different parts
- Entry: This is where the lambda http event is handled and what function is called via the serverless.yml configuration
- Command Creator: Each http event is constructed into a command
- That command is vaidated that it matches correct syntax. io-ts (https://github.com/gcanti/io-ts) is used for command and event validation
- The command is checked in DynamoDB to avoid duplication. Each command needs a unique id provided by the caller
- The command is turned into an event which matches the Dynamo 'schema'
- The event is applied to the item to make sure it matches business rules. For example:
-- If there is a business rule that you cannot adjust an inventory item below 0, applying the event to the item will verify that it will follow those business rules by checking that the current item quantity + adjust quantity > 0
- If the event follows all validation and business rules, the event is saved
- When the event is saved, a DynamoDB listener events an event on an SNS bus for any views that have to update from a given event

#### Folder structure
- Each service is in the 'services' directory. The services are the entry point into the application
- Shared code is in the `infrastructure` directory. This includes http handling, logging, persistence, etc.
- Database access code is in the `repo` directory. This holds the code for getting and saving inventory items and events. Note that the inventory items are not actually retrieved from the repo - but compiled from their events. using `getById` from the repo abstracts that. The command handlers should not know anything about the persistence layer.
- There is one lambda that subscribes to the the DynamoDB Event stream, and publishes it to an SNS bus. This is in the `stream-hander` directory.

### Database Design
The Inventory Services uses DynamoDB. DynamoDB has a strict query language that is enforced via indices. To see the database design look at the InventoryEventsTable specification in the `serverless.yml`

CustomerId is used as a primary key to enforce some data segegration. This is a required field. commandId is a range key used to check for duplicate keys.
