---
layout: mypost
title: VirtualBox网路配置
categories: [小技巧]
---

一直以来，VirtualBox 的网络配置的都是 NAT 和 Host-only。平时使用起来没有多大问题，NAT 用来访问外网， Host-only 用来分配一个 IP 用于在宿主机访问虚拟机内容。在模拟搭建集群的时候需要做到虚拟机-虚拟机互通和虚拟机-宿主机互通，这种情况只能使用桥接网络了。在配置的过程中遇到了一些小问题，这里做下记录

## 网络通信

[Introduction to Networking Modes](https://www.virtualbox.org/manual/ch06.html)

![network](network.png)

## 端口转发

一般用于 NAT 模式，把部分端口暴露在宿主机上

![port-forward](port-forward.png)

## Host-only

建立一个虚拟网卡（自带 DHCP），为每个使用的虚拟机分配一个 IP，在主机上可以访问到每个 IP，但是虚拟机却无法访问到主机

比如下图，在主机和虚拟机分配到的 IP 如下

```
以太网适配器 VirtualBox Host-Only Network:

   连接特定的 DNS 后缀 . . . . . . . :
   本地链接 IPv6 地址. . . . . . . . : fe80::f45c:5285:c488:8621%35
   IPv4 地址 . . . . . . . . . . . . : 192.168.250.1
   子网掩码  . . . . . . . . . . . . : 255.255.255.0
   默认网关. . . . . . . . . . . . . :
```

```
enp0s8: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.250.3  netmask 255.255.255.0  broadcast 192.168.250.255
        inet6 fe80::2fe3:e376:c398:49cb  prefixlen 64  scopeid 0x20<link>
        ether 08:00:27:51:ef:d6  txqueuelen 1000  (Ethernet)
        RX packets 1  bytes 590 (590.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 15  bytes 1454 (1.4 KiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```

![host-only-1](host-only-1.png)

![host-only-2](host-only-2.png)

![host-only-3](host-only-3.png)

## Bridged

桥接模式，这种模式网络功能支持的最好。可以桥接到真实的网卡，但是没网的话就不行了，所以推荐在本地创建一个虚拟网卡

![virtual-net](virtual-net.png)

![config-net](config-net.png)

```
以太网适配器 VBOX Bridge:

   连接特定的 DNS 后缀 . . . . . . . :
   本地链接 IPv6 地址. . . . . . . . : fe80::7005:787e:d1b8:7495%2
   IPv4 地址 . . . . . . . . . . . . : 192.168.88.1
   子网掩码  . . . . . . . . . . . . : 255.255.255.0
   默认网关. . . . . . . . . . . . . : 0.0.0.0
```

![bridge-1](bridge-1.png)

在桥接模式下，桥接到真实网卡时（比如 WIFI 网卡），由于路由器自带 DHCP，虚拟机可以分配到 IP 地址。桥接到虚拟网卡时，由于没有 DHCP 服务器，虚拟机会分配不到到 IP 地址

- 方案 1

  在主机内安装`dhcpsrv`这个软件，管理指定网卡

- 方案 2

  在虚拟机内配置静态 IP，不同的系统可能不一样，这里以 CentOS 7 为例

  首先确定网卡名称，`ip addr`，一般网卡 2 对应的是序号 3 的设备。如果无法确定，可以先去掉，重启后看看那个设备没了

  ```
  # 这里的是 enp0s8, 修改 /etc/sysconfig/network-scripts/ifcfg-enp0s8
  TYPE=Ethernet
  BOOTPROTO=static
  ONBOOT=yes
  DEVICE=enp0s8
  NAME=enp0s8
  IPADDR=192.168.88.2
  NETMASK=255.255.255.0
  ```

  如果文件不存在可以直接创建，内容为上面的代码。或者使用下面的代码创建一个配置文件再进去修改

  ```
  nmcli conn show
  nmcli con mod "有线连接 1" ipv4.addresses 192.168.88.2/24
  ```

  修改完成后重启网络

  ```
  service network restart
  ```

  ```
  enp0s8: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
          inet 192.168.88.2  netmask 255.255.255.0  broadcast 192.168.88.255
          inet6 fe80::a00:27ff:fe27:5466  prefixlen 64  scopeid 0x20<link>
          ether 08:00:27:27:54:66  txqueuelen 1000  (Ethernet)
          RX packets 142  bytes 15324 (14.9 KiB)
          RX errors 0  dropped 0  overruns 0  frame 0
          TX packets 109  bytes 28534 (27.8 KiB)
          TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
  ```

  Ubuntu 22 配置步骤

  1. `ifconfig` 查看要设置的网卡名称，如果看不到执行 `ifconfig -a`，然后开启 `ifconfig up $name`

  2. 编辑文件 `/etc/netplan/00-installer-config.yaml`，新增配置， 这里的名称是 enp0s8

     ```yaml
     network:
       ethernets:
         enp0s3:
           dhcp4: true
         enp0s8:
           dhcp4: false
           dhcp6: false
           addresses: [192.168.88.4/24]
       version: 2
     ```

  3. 执行 `netplan apply` 应用配置

## 注意

如果在桥接模式下，虚拟机内无法访问到主机，可以检查下主机的防火墙配置。如果关掉防火墙可以访问，那么说明是被入站规则拦截了，加一条规则就行了。

需要注意的是规则有匹配顺序，如果配置规则后仍无法访问，可能是被另一条规则给拦住了

![firewall](firewall.png)
