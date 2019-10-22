# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 1.0.0 - 2019-21-10

### Added

- Intial commit of code. This package utilizies the [resource-decorator](https://github.com/epandco/resource-decorator)
  project to generate a http resource for express.
- Pino logger is included in this and injected via Inversify into each resource instnance created per request. 