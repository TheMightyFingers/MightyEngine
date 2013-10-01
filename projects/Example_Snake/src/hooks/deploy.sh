#!/bin/bash

#this is sample script with rcync command called after deploy is finished



#synces deployed files with server web root
# man rsync - for more info

# $1 - projectName
# $2 - branchName

rsync -av ./ /var/www/$1/
