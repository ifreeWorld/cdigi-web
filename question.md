问题 1：
windows 上启动 docker compose 出现 Error response from daemon: Ports are not available: exposing port TCP 0.0.0.0:6300 -> 0.0.0.0:0: listen tcp 0.0.0.0:6300: bind: An attempt was made to access a socket in a way forbidden by its access permissions.

解决：

```bash
net stop winnat
net start winnat
```
