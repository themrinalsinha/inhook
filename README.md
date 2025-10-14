<div align="center">
  <img src="assets/inhook.png" align="center" width="200"/>
</div>

----
**Webhook Inspector & Debugger** -
A fast, self-hosted webhook inspector for capturing and analyzing requests in real time - packaged as a single binary.

![](/assets/splash.png)

## Installation

### Local
**Prerequisites:**
You need to have `Go` and `pnpm` installed.

To run locally:
```shell
make run
```
This will build the frontend and backend and run the server on `http://localhost:9000`.
You can change the port by editing the `config.toml` file.
```toml
[app]
port = ":9000"
```

### Docker
TBD

### Binary
TBD

### Developers
The backend is written in Go and frontend is in React for the UI.

### License
TBD
