#!/usr/bin/env bash
set -e
printf '\n== Docker ==\n'
docker --version
printf '\n== Containers ==\n'
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
printf '\n== IPs ==\n'
hostname -I
