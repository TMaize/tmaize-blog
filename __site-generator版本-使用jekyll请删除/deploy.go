package main

import (
	"archive/zip"
	"encoding/xml"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/pkg/sftp"
	"golang.org/x/crypto/ssh"
)

type Server struct {
	Name    string
	Pwd     string
	Address string
	Port    int
}

type Config struct {
	AppPath    string
	UploadPath string
	DeployPath string
	Server     Server
}

var (
	config Config
)

/*
本地目录压缩，sftp上传，备份，解压
go run deploy.go config.go
*/
func main() {
	config = loadConfig()
	zipName := time.Now().Format("20060102_150405.zip")
	zipFilePath := filepath.Join(config.AppPath, "..", zipName)
	remoteZipFilePath := splitLinux(filepath.Join(config.UploadPath, zipName))
	fmt.Println("开始压缩" + config.AppPath)
	compress(config.AppPath, zipFilePath)
	fmt.Println("压缩完毕" + config.AppPath)
	if sshClient, sftpClient, err := connect(config.Server.Name, config.Server.Pwd, config.Server.Address, config.Server.Port); err == nil {
		defer sshClient.Close()
		defer sftpClient.Close()
		upload(zipFilePath, remoteZipFilePath, sftpClient)
		script := fmt.Sprintf("rm -rf %s", config.DeployPath)
		exec(script, sshClient, true)
		script = fmt.Sprintf("unzip -o -q %s -d %s", remoteZipFilePath, config.DeployPath)
		exec(script, sshClient, true)
		fmt.Println("部署完毕")
	} else {
		fmt.Println(err)
	}
}

func connect(user, password, host string, port int) (*ssh.Client, *sftp.Client, error) {
	var (
		auth         []ssh.AuthMethod
		addr         string
		clientConfig *ssh.ClientConfig
		sshClient    *ssh.Client
		sftpClient   *sftp.Client
		err          error
	)

	auth = make([]ssh.AuthMethod, 0)
	auth = append(auth, ssh.Password(password))

	clientConfig = &ssh.ClientConfig{
		User:    user,
		Auth:    auth,
		Timeout: 30 * time.Second,
		HostKeyCallback: func(hostname string, remote net.Addr, key ssh.PublicKey) error {
			return nil
		}}

	addr = fmt.Sprintf("%s:%d", host, port)

	if sshClient, err = ssh.Dial("tcp", addr, clientConfig); err != nil {
		return nil, nil, err
	}
	if sftpClient, err = sftp.NewClient(sshClient); err == nil {
		return sshClient, sftpClient, err
	}
	defer sshClient.Close()
	return nil, nil, errors.New("sftpClient失败")
}

func compress(zipDir, saveFile string) {
	_, err := os.Stat(saveFile)
	if err == nil {
		panic(fmt.Sprint("目标", saveFile, "已存在", err))
	}
	dir, err := os.Open(zipDir)
	if err != nil {
		panic(fmt.Sprint("压缩目录", zipDir, "不存在", err))
	}
	defer dir.Close()
	if info, err := dir.Stat(); err != nil || !info.IsDir() {
		panic(fmt.Sprint("压缩目录", zipDir, "不是目录", err))
	}

	outFile, err := os.Create(saveFile)
	if err != nil {
		panic(fmt.Sprint(err))
	}
	defer outFile.Close()
	// 创建一个压缩文档
	zipDocument := zip.NewWriter(outFile)
	defer zipDocument.Close()
	filepath.Walk(zipDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			panic(fmt.Sprint("遍历目录", zipDir, "失败", err))
		}
		if relativePath, err := filepath.Rel(zipDir, path); err == nil && !info.IsDir() && !strings.HasPrefix(relativePath, ".git") {
			header, _ := zip.FileInfoHeader(info)
			header.Name = splitLinux(relativePath)
			// 不要使用 zipDocument.Create 许多信息要手动去设置，不然会出现各种稀奇古怪的问题
			writer, _ := zipDocument.CreateHeader(header)
			f, err := os.Open(path)
			if err == nil {
				io.Copy(writer, f)
				f.Close()
			}
		}
		return err
	})
}

func upload(localFile, remoteFile string, sftpClient *sftp.Client) {
	if _, err := sftpClient.Stat(remoteFile); err == nil {
		panic("文件" + remoteFile + "在服务器上已存在")
	}
	remotePath := splitLinux(filepath.Join(remoteFile, ".."))
	sftpClient.MkdirAll(remotePath)
	dstFile, err := sftpClient.Create(remoteFile)
	if err != nil {
		panic("创建" + remoteFile + "失败")
	}
	defer dstFile.Close()

	srcFile, err := os.Open(localFile)
	if err != nil {
		panic("打开本地文件失败")
	}
	srcFileInfo, _ := srcFile.Stat()
	defer srcFile.Close()

	i := 0
	var chunkSize = 1024 * 512 // 512kb
	var chunkNumber = int(srcFileInfo.Size()) / chunkSize
	if srcFileInfo.Size()%int64(chunkSize) != 0 {
		chunkNumber++
	}
	buf := make([]byte, chunkSize)
	for {
		n, _ := srcFile.Read(buf)
		if n == 0 {
			break
		}
		i++
		if i != chunkNumber {
			fmt.Printf("上传到：%s,进度%d/%d\r", remoteFile, i, chunkNumber)
		} else {
			fmt.Printf("上传到：%s,成功                 \n", remoteFile)
		}
		dstFile.Write(buf[:n])
	}
}

func exec(cmd string, sshClient *ssh.Client, show bool) {
	session, err := sshClient.NewSession()
	if err != nil {
		panic(fmt.Sprint("创建会话失败", err))
	}
	defer session.Close()
	if show {
		session.Stdout = os.Stdout
		session.Stderr = os.Stderr
	}
	fmt.Println("执行命令:" + cmd)
	if session.Run(cmd) != nil {
		panic(fmt.Sprint("执行命令出错", err))
	}
}

func splitLinux(path string) string {
	return strings.Replace(path, "\\", "/", -1)
}

func loadConfig() Config {
	config := Config{}
	data, err := ioutil.ReadFile("config.xml")
	if err != nil {
		log.Fatal("读取错误")
	}
	if err := xml.Unmarshal(data, &config); err != nil {
		log.Fatal("解析错误", err)
	}
	// fmt.Printf("%+v\n", config)
	return config
}
