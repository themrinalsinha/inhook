<div align="center">
  <img src="assets/inhook.png" align="center" width="200"/>
</div>



----
**Webhook Inspector & Debugger** -
A fast, self-hosted webhook inspector for capturing and analyzing requests in real time - packaged as a single binary.

![](/assets/splash.png)

## Installation

### Local Development
The backend is written in Go and frontend is in React. You need to have `Go` and `pnpm` installed.

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

### Binary
You can build the binary by running:
```shell
make build
```
To run the binary with custom config, you can pass the config file as an argument:
```shell
./inhook --config config.toml
```

### Docker
TBD

### License
inHook is licensed under the [MIT](LICENSE.md) license.

----
<div align="right">
  <a href="https://www.buymeacoffee.com/themrinalsinha" target="_blank">
    <img src="assets/bmc-button.png" width="150" alt="Buy Me A Coffee" />
  </a>
</div>
