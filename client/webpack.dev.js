import { merge } from "webpack-merge"
import commonConfig from "./webpack.common.js"
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = merge(commonConfig, {
    mode: "development",
    output: {
        filename: "index_bundle.js",
        path: path.join(__dirname, "dist/static"),
        publicPath: "/static/"
    },
    module: {
        rules: [
            {
                test: /\.css?$/,
                use: ["style-loader", "css-loader"]
            }
        ]    
    },
})

export default config