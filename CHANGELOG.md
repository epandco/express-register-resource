# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 2.0.3 - 2019-10-30

### Change

- Return 204 for no content not 201.

## 2.0.2 - 2019-10-27

### Change

- Now handling unexpected errors when thrown by a resource. Unexpected being any error that is not a ResourceError.

## 2.0.1 - 2019-10-26

### Change

- Minor change from resource-decorator upgrade. Latest version renames expectedError to fatalError in the ResourceRenderer interface.

## 2.0.0 - 2019-10-26

### Change

- Upgrade to version 2.0.0 of the resource decorator pacakge and resolving breaking changes that the update carried with it.

## 1.1.3 - 2019-10-25

### Change

- Significant changes to underlying generated routes.


## 1.0.2 - 2019-10-24

### Fix

- PinoLogger would not be unbound properly with inversify if an error was thrown by the resource. 

## 1.0.1 - 2019-10-23

### Added

- Middleware decorators for resource and route level middleware.

## 1.0.0 - 2019-10-21

### Added

- Intial commit of code. This package utilizies the [resource-decorator](https://github.com/epandco/resource-decorator)
  project to generate a http resource for express.
- Pino logger is included in this and injected via Inversify into each resource instnance created per request. 