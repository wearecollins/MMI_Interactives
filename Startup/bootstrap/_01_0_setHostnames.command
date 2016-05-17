#!/usr/bin/env bash
echo ""
sudo -v -p "Please enter the administrator's password: "
echo -n "Enter the hostname for this computer: "
read name
sudo scutil --set HostName $name
sudo scutil --set LocalHostName $name
sudo scutil --set ComputerName $name
killall Terminal