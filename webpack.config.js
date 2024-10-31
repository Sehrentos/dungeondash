import path from 'path';
import url from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default {
	mode: 'development',
	entry: './src/main.js',
	plugins: [
		new HtmlWebpackPlugin({
			title: 'NodeJS Game Server',
		}),
	],
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: ['style-loader', 'css-loader'],
			},
			// {
			// 	test: /\.(png|jpg|jpeg|gif|svg|ttf)$/,
			// 	use: [{
			// 		loader: 'url-loader',
			// 		options: { limit: 10000 } // Convert images < 10k to base64 strings
			// 	}]
			// },
			{
				test: /\.(png|jpg|jpeg|gif|svg|ttf)$/,
				loader: 'file-loader'
			},
			{
				test: /\.(fnt|xml)$/,
				loader: 'file-loader'
			},
			{
				test: /\.(wav|mp3)$/,
				loader: 'file-loader'
			},
		],
	},
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist'),
		clean: true,
	},
}