@echo off

echo 0.安装  1.启动(8899)  2.编译  3.部署
set input=
set /p input=请输入选项:

if "%input%" == "0" call :installFunc
if "%input%" == "1" call :startFunc  8899
if "%input%" == "2" call :buildFunc
if "%input%" == "3" call :deployFunc

goto :eof

:installFunc
call bundle install
goto :eof

:startFunc
call bundle exec jekyll serve --watch --host=0.0.0.0 --port=%1%
goto :eof

:buildFunc
call bundle exec jekyll build --destination=dist
goto :eof

:deployFunc
REM 编译
call :buildFunc
REM 切换到发布工具目录
D:
cd D:\vscode-work-space\workspace-go\blog-deploy
go run main.go
REM 回到脚本目录
%~d0
cd %~dp0
goto :eof