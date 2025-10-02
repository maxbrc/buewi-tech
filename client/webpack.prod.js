import { merge } from "webpack-merge"
import commonConfig from "./webpack.common.js"
import path from "path";
import { fileURLToPath } from 'url';
import MiniCssExtractPlugin from "mini-css-extract-plugin"

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = merge(commonConfig, {
    mode: "production",
    output: {
        filename: "index_bundle_[contenthash].js",
        path: path.join(__dirname, "dist/static"),
        publicPath: "/static/"
    },
    module: {
        rules: [
            {
                test: /\.css?$/,
                use: [MiniCssExtractPlugin.loader, "css-loader"]
            }
        ]    
    },
    plugins: [
        new MiniCssExtractPlugin()
    ]
})

export default config