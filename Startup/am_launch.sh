#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR/../Webserver"
npm start -- --station anythingmuppets
#/usr/local/bin/npm start -- --station anythingmuppets
