<div align="center">
  <img src="assets/inhook.png" align="center" width="200"/>
</div>
<hr/>
<table align="center" border="0" cellspacing="0" cellpadding="10">
  <tr>
    <td align="center" border="0"><a href="https://www.producthunt.com/products/inhook?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-inhook" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1028883&theme=light&t=1761055390831" alt="InHook - Webhook inspector & debugger | Product Hunt" width="250" height="54"/></a></td>
    <td align="center" border="0"><a href="https://peerlist.io/themrinalsinha/project/inhook--webhook-inspector--debugger" target="_blank" rel="noreferrer"><img src="https://peerlist.io/api/v1/projects/embed/PRJHQ7M9L9OE9GLNB1OLADN7MP7EOP?showUpvote=true&theme=light" alt="InHook - Webhook Inspector & Debugger" height="54"/></a></td>
  </tr>
</table>

----
**Webhook Inspector & Debugger** -
A fast, self-hosted webhook inspector for capturing and analyzing requests in real time - packaged as a single binary.

![](/assets/splash.png)
Visit <a href="https://inhook.mrinal.xyz" target="_blank">https://inhook.mrinal.xyz ↗</a> - to try it out.


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
