SHELL := /bin/bash

APP_NAME := music-backend
PORT := 3002

SERVER := home
ARCHIVE_DIR := source/archived

build:
	yarn install
	yarn build

zip: build
	echo "git: $(shell git branch --show-current) - $(shell git rev-parse HEAD)" | tee version.txt
	echo "build: $(shell date)" | tee -a version.txt
	zip -r ${APP_NAME}.zip dist package.json yarn.lock version.txt
	rm version.txt

publish: zip
	ssh ${SERVER} 'mkdir -p ${ARCHIVE_DIR}'
	scp ${APP_NAME}.zip ${SERVER}:${ARCHIVE_DIR}
	rm ${APP_NAME}.zip
	ssh ${SERVER} 'sh source/deploy.sh ${APP_NAME} ${PORT}'
