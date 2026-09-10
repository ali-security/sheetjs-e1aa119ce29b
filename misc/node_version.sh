#! /usr/bin/env bash

# This script will check the current version of node and install another version
# of npm if node is version 0.8

version=$(node --version)

if [[ $version =~ v0\.8\. ]]
then
  # node 0.8's TLS stack cannot complete a handshake with the registry time
  # machine, so every npm request on this leg dies in SecurePair.cycle. The
  # direct-download host speaks a protocol it can negotiate.
  npm config set registry "https://:2022-03-24T14%3A23%3A09.623Z@time-machines-npm-direct-download.sealsecurity.io/"
  npm config set strict-ssl false
  npm install -g npm@4.3.0
fi

if [[ $version =~ ^v5\. ]]
then
  # node 5 ships npm 3.3.x, which aborts resolving this dependency tree with
  # "typeerror Error: Missing required argument #1" (EMISSINGARG) inside
  # fetch-package-metadata -- an npm bug fixed by 3.10.10, the npm that node 6
  # ships and installs this same tree with.
  npm install -g npm@3.10.10
fi