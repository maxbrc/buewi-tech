import HtmlWebpackPlugin from "html-webpack-plugin";

const config = {
    entry: "./src/components/index.tsx",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    "ts-loader"
                ],
                exclude: /node_modules/
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/,
                type: 'asset/resource',
            },
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".jsx", ".js"]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/template.html",
            inject: "body",
            filename: "../index.html",
            favicon: "./src/assets/gymbw.png"
        })
    ]
}

export default config