
# 使用JQ 获取JSON文件对应的value值，并+1重新赋值给JSON 文件内
JQ_EXEC=`which jq`

FILE_PATH=build/version.json

# 获取version字段
version=$(cat $FILE_PATH | ${JQ_EXEC} .version | sed 's/\"//g')

echo '旧版本：'$version 

version=$[version + 1]

echo '新版本：'$version

sed -i "" "s/\"version\":.*$/\"version\": \"$version\"/" build/version.json