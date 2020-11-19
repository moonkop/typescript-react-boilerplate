const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
//const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

// const WebpackParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');
// let sassExtract = new ExtractTextPlugin('sass.css');
var path = require('path');
var webpack = require('webpack');
var precss = require('precss');
var isWin = /^win/.test(process.platform);
var qnuiReg = isWin ? new RegExp(/node_modules\\.*qnui.*/) : new RegExp(/node_modules\/.*qnui.*/);

let cwd = process.cwd();
let SINGLE_PAGE = process.env.SINGLE_PAGE;
var from = process.env.FROM ? process.env.FROM : "tb";

var globby = require('globby');
var files = globby.sync(['**/pages/*'], { cwd: cwd + '/src' });
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';
// update 取消其他多余页面的打包 固定只有俩
// files.forEach((item) => {
//   entry[item + '/index'] = ['./src/' + item + '/index.js'];
// });
let reg = /--version=.+/;
let version = 'unknown';
process.argv.map(item=>{
    if (reg.test(item)){
        version = item.split("=")[1];
    }
})
let mode=process.argv.indexOf("--mode=development")!=-1?'development':'production'
console.log(version);
let config = {
	entry:{
        'index': [ './src/index.tsx' ],
    },
	output: {
		path: path.resolve(__dirname,'dist/'+version+'/build'),
		publicPath: 'build',
		filename: '[name].js',
		chunkFilename: '[name].js',
        sourceMapFilename: `../sourceMaps/[name].map`
		// chunkFilename: '[name]_[chunkhash:8]_chunk.js'
	},
	resolve: {
		extensions: ['*', '.js', '.jsx','.ts','.tsx'],
		alias: {
			componentBase: path.join(__dirname, 'src/componentBase'),
			componentsNew: path.join(__dirname, 'src/components/'+from),
			components: path.join(__dirname, 'src/components'),
			utils: path.join(__dirname, 'src/public/utils'),
			styles: path.join(__dirname, 'src/styles'),
			pages: path.join(__dirname, 'src/pages'),
			public: path.join(__dirname, 'src/public'),
			tradePublic: path.join(__dirname, 'src/tradePublic'),
            tradePolyfills: path.join(__dirname, 'src/tradePolyfills'),
			publicComponents: path.join(__dirname, 'src/public/components')
		}
	},
	externals: {
		'react': 'React',
		'react-dom': 'ReactDOM',
		'react-redux': 'ReactRedux',
		'react-router': 'ReactRouter',
		'react-router-redux': 'ReactRouterRedux',
		'redux-thunk': 'var window.ReduxThunk.default',
		'redux': 'Redux',
		'qnui': 'qnui',
		'fixed-data-table-2': 'FixedDataTable',
		'react/lib/ReactTransitionGroup': 'var window.React.addons.TransitionGroup',
		'react/lib/ReactCSSTransitionGroup': 'var window.React.addons.CSSTransitionGroup'
	},
	module: {
		rules: [
			{
			exclude: /node_modules/,
			test: /\.(ts|tsx)?$/,
			use: "ts-loader",
		},
			{
				test: /\.(jsx|js)?$/,
				use: {
					loader: 'babel-loader',
					options: {
						cacheDirectory: true,
					}
				},
				exclude:/node_modules/
			},
			{
				test: /\.scss/,
					include: [
						path.resolve(__dirname,'src'),
						qnuiReg
				],
				use: [
						MiniCssExtractPlugin.loader,  // replace ExtractTextPlugin.extract({..})
						'css-loader?cacheDirectory=true',
						'postcss-loader',
						'sass-loader?cacheDirectory=true'
					]
		}]
	},
	optimization: {
		// minimize:true,
	    minimizer: [
			new UglifyJsPlugin({
			cache: true,
			parallel: true,
			sourceMap: true
			}),
			new OptimizeCSSAssetsPlugin({
				cssProcessorOptions: {
				  	safe: true
				}
			})  // use OptimizeCSSAssetsPlugin
		],
		splitChunks: {
		    cacheGroups: {
				vendor: {
					test: /node_modules/,
					name: "vendor",
					priority: 10,
					chunks: "all"
			    }
			}
	    }
  	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: '[name].bundle.css',
			chunkFilename: '[name].vendor.css'  // use contenthash *
		}),
	// 	mode=="development"&& new ForkTsCheckerWebpackPlugin({
	// 	//	typescript: resolve.sync('typescript',
	// 		//	{ basedir: paths.appNodeModules }
	// 	//		),
	// 	//	async: isEnvDevelopment,
	// 		async: true,
	// 	//	useTypescriptIncrementalApi: true,
	// 	//	eslint:false,
	// 	//	checkSyntacticErrors: true,
	// 		// resolveModuleNameModule: process.versions.pnp
	// 		// 	? `${__dirname}/pnpTs.js`
	// 		// 	: undefined,
	// 		// resolveTypeReferenceDirectiveModule: process.versions.pnp
	// 		// 	? `${__dirname}/pnpTs.js`
	// 		// 	: undefined,
	// 	//	tsconfig: paths.appTsConfig,
	// 	// 	reportFiles: [
	// 	// 		'**',
	// 	// 		'!**/__tests__/**',
	// 	// 		'!**/?(*.)(spec|test).*',
	// 	// 		'!**/src/setupProxy.*',
	// 	// 		'!**/src/setupTests.*',
	// 	// 	],
	// //		silent: false,
	// 		// The formatter is invoked directly in WebpackDevServerUtils during development
	// 		//formatter: isEnvProduction ? typescriptFormatter : undefined,
	// 	//	workers:1,
	// 				memoryLimit:8192,
	// 	}),

		// 允许错误不打断程序
		new webpack.NoEmitOnErrorsPlugin(),


		// 环境变量定义
		new webpack.DefinePlugin({
		  _FROM_: JSON.stringify(from=="tb"?"TAO":from),
			_ROLE_: JSON.stringify(process.argv.indexOf("--role=C")!=-1 ? "C" : "B")
		})
	].filter(Boolean),
	devServer:{
		contentBase:cwd,// 配置开发服务运行时的文件根目录
		host:'0.0.0.0',// 开发服务器监听的主机地址
		compress:true,   // 开发服务器是否启动gzip等压缩
		port:9000,        // 开发服务器监听的端口
		disableHostCheck: true,
		progress:true,
		headers: {
			"Access-Control-Allow-Origin": "*",
		}
	},
	stats: { children: false }
}
 config.devtool = 'source-map'
 if (process.argv.indexOf("--mode=development")!=-1)
 {
 	config.devtool = 'eval-cheap-module-source-map';
 }

// 如果需要单个的start或者build
if (SINGLE_PAGE) {
	const key = 'pages/' + SINGLE_PAGE + '/index';
	config.entry = {};
	config.entry[key] = ['./src/pages/' + SINGLE_PAGE + '/index.js'];
}
module.exports = config;
