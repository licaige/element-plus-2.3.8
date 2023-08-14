import path from 'path'
import chalk from 'chalk'
import { dest, parallel, series, src } from 'gulp'
import gulpSass from 'gulp-sass'
import dartSass from 'sass'
import autoprefixer from 'gulp-autoprefixer'
import cleanCSS from 'gulp-clean-css'
import rename from 'gulp-rename'
import consola from 'consola'
import { epOutput } from '@element-plus/build-utils'

const distFolder = path.resolve(__dirname, 'dist')
const distBundle = path.resolve(epOutput, 'theme-chalk')

/**
 * compile theme-chalk scss & minify
 * not use sass.sync().on('error', sass.logError) to throw exception
 * @returns
 */
/*
 *构建ThemeChalk
 * */
function buildThemeChalk() {
  const sass = gulpSass(dartSass)
  //对应正则要求
  const noElPrefixFile = /(index|base|display)/
  // 读取scr文件夹下面的scss文件
  return (
    src(path.resolve(__dirname, 'src/*.scss'))
      // 解析scss文件
      .pipe(sass.sync())
      // 加样式前缀
      .pipe(autoprefixer({ cascade: false }))
      .pipe(
        // css压缩处理
        cleanCSS({}, (details) => {
          consola.success(
            `${chalk.cyan(details.name)}: ${chalk.yellow(
              details.stats.originalSize / 1000
            )} KB -> ${chalk.green(details.stats.minifiedSize / 1000)} KB`
          )
        })
      )
      .pipe(
        // 重命名
        rename((path) => {
          if (!noElPrefixFile.test(path.basename)) {
            path.basename = `el-${path.basename}`
          }
        })
      )
      // 放入到对应dist文件下面
      .pipe(dest(distFolder))
  )
}

/**
 * Build dark Css Vars
 * @returns
 */
/*
 *创建DarkCssVars
 * 把src/dark/css-vars.scss文件解析之后，放入到对应dist/dark文件夹下面
 * */
function buildDarkCssVars() {
  const sass = gulpSass(dartSass)
  return src(path.resolve(__dirname, 'src/dark/css-vars.scss'))
    .pipe(sass.sync())
    .pipe(autoprefixer({ cascade: false }))
    .pipe(
      cleanCSS({}, (details) => {
        consola.success(
          `${chalk.cyan(details.name)}: ${chalk.yellow(
            details.stats.originalSize / 1000
          )} KB -> ${chalk.green(details.stats.minifiedSize / 1000)} KB`
        )
      })
    )
    .pipe(dest(`${distFolder}/dark`))
}

/**
 * copy from packages/theme-chalk/dist to dist/element-plus/theme-chalk
 */
/*
 *把packages/theme-chalk/dist文件复制到dist/element-plus/theme-chalk下面去
 * */
export function copyThemeChalkBundle() {
  return src(`${distFolder}/**`).pipe(dest(distBundle))
}

/**
 * copy source file to packages
 */
/*
 *读取本包下面的src文件到对应最外层dist对应的theme-chalk文件夹src下面
 * */
export function copyThemeChalkSource() {
  return src(path.resolve(__dirname, 'src/**')).pipe(
    dest(path.resolve(distBundle, 'src'))
  )
}
// 并行操作
export const build = parallel(
  copyThemeChalkSource,
  // 串行操作
  series(buildThemeChalk, buildDarkCssVars, copyThemeChalkBundle)
)

export default build
