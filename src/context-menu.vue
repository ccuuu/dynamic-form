<script>
import { MenuText } from './utils/Enum'

export default {
  render(_c) {
    const _this = this
    const createBasic = () => {
      return _c(
        'transition',
        { props: { name: 'fade' } },
        _this.display
          ? [
              _c(
                'div',
                {
                  ref: 'contextMenu',
                  class: 'context-menu',
                  style: {
                    left: _this.pageX + 'px',
                    top: _this.pageY + 'px',
                  },
                },
                [createOptions()]
              ),
            ]
          : null
      )
    }
    const createOptions = () => {
      return _c(
        'ul',
        _this.options.map((option, index) => {
          return _c(
            'li',
            {
              class: 'menu-li',
              style: {
                'padding-top': index / 1 === 0 ? '10px' : '6px',
                'padding-bottom':
                  index / 1 === _this.options.length - 1 ? '10px' : '6px',
                'border-top': index / 1 !== 0 ? 'solid 1px #ecf5ff' : '',
              },
              on: {
                mousedown: (e) => {
                  e.stopPropagation()
                },
                contextmenu: (e) => {
                  e.stopPropagation()
                  e.preventDefault()
                },
                click: _this[option],
              },
            },
            MenuText[option]
          )
        })
      )
    }
    return createBasic()
  },
  data() {
    return { display: false }
  },
  mounted() {
    console.log('menu')

    this.initContextMenu()
    this.initEvent()
  },
  methods: {
    async initContextMenu() {
      this.display = true
    },
    initEvent() {
      document.body.addEventListener('mouseup', this.closeMenu)
    },

    closeMenu(e) {
      //需要等待click事件回调之后销毁，因此选择宏任务执行
      setImmediate(() => this.$destroy())
    },
  },
  beforeDestroy() {
    document.body.removeChild(this.$el)
    document.body.removeEventListener('mouseup', this.closeMenu)
  },
}
</script>
<style scoped>
.context-menu {
  color: #717377;
  font-size: 13px;
  background-color: white;
  border: 1px solid #d1e4ff;
  border-radius: 6px;
  box-shadow: 4px 4px 10px 1px rgb(0 0 0 / 10%);
  position: absolute;
  z-index: 2000;
}
.menu-li {
  list-style: none;
  padding-left: 10px;
  padding-right: 20px;
}
.context-menu ul {
  padding: 0;
  margin: 0;
}
.context-menu ul :hover {
  cursor: pointer;
  transition: all 0.1s;
  color: #262629;
  background-color: #ecf5ff;
}
.fade-enter-active {
  transition: opacity 0.2s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
