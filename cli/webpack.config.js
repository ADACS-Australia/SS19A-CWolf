const path = require('path');

module.exports = {
    target: 'node',
    entry: './src/entry.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.worker\.js$/,
                use: {
                    loader: 'worker-loader',
                    options: {
                        inline: true,
                        fallback: false
                    }
                }
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            "@babel/preset-env",
                            "@babel/preset-react"
                        ],
                        plugins: [
                            "@babel/plugin-proposal-class-properties"
                        ]
                    }
                }
            },
            // {
            //     test: /\.(png|jp(e*)g|svg)$/,
            //     use: [
            //         {
            //             loader: 'url-loader',
            //             options: {
            //                 // limit: 8000, // Convert images < 8kb to base64 strings
            //                 name: 'images/[hash]-[name].[ext]'
            //             }
            //         }
            //     ]
            // }

        ]
    },
    plugins: [
    ],
    resolve: {
        extensions: ['.js', '.jsx']
    },
};
