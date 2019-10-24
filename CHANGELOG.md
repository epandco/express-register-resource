# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 1.0.2 - 2019-24-10

### Fix

- PinoLogger would not be unbound properly with inversify if an error was thrown by the resource. 

## 1.0.1 - 2019-23-10

### Added

- Middleware decorators for resource and route level middleware.

## 1.0.0 - 2019-21-10

### Added

- Intial commit of code. This package utilizies the [resource-decorator](https://github.com/epandco/resource-decorator)
  project to generate a http resource for express.
- Pino logger is included in this and injected via Inversify into each resource instnance created per request. 