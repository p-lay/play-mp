# Path to this plugin
PROTOC_GEN_TS_PATH="./node_modules/protoc-gen-json-ts/bin/protoc-gen-json-ts"

# Directory to write generated code to (.js and .d.ts files) 
OUT_DIR="./src/service"


contract:
	protoc --plugin=protoc-gen-ts=${PROTOC_GEN_TS_PATH} --ts_out=${OUT_DIR} \
    -I ./proto \
    ./proto/vue.proto \
    ./proto/resource.proto \