import { MenuEnum, MenuAction } from '../utils/Enum'

export default {
  data() {
    return {
      actionBeginIndex: 0,
      actionEndIndex: 0,
      targetIndex: 0,
      indexCache: [],
    }
  },
  methods: {
    contextmenuEvent(e) {
      e.preventDefault()

      const params = { event: e }
      params.options = this.selectElement.length
        ? [MenuEnum.CopyAll, MenuEnum.DeleteAll]
        : [
            MenuEnum.Copy,
            MenuEnum.ReviseInfo,
            MenuEnum.InsertBefore,
            MenuEnum.InsertAfter,
            MenuEnum.Delete,
          ]
      if (this.selectElement.length) {
        params.range = [this.beginRowIndex, this.endRowIndex]
      } else {
        const index = this.constraints.findIndex((item) =>
          item.some((i) => i === this.findElementContainer(e.pageX, e.pageY))
        )
        params.range = [index, index]
      }

      this.contextMenuActivation(params)
    },
    contextMenuActivation({ options, event, range }) {
      if (range) {
        this.indexCache = range.sort((a, b) => a - b)
      }
      options = Object.fromEntries(
        options.map((option) => [option, this[MenuAction[option]]])
      )
      this.$contextMenu({ event, options })
    },
    deleteHandler() {
      this.actionDetermine()
      this.deleteRowHandler(this.actionBeginIndex, this.actionEndIndex)
      if (this.actionBeginIndex !== this.actionEndIndex)
        this.resetSelectElement()
    },
    copyHandler() {
      this.actionDetermine()
      if (this.actionBeginIndex !== this.actionEndIndex)
        this.resetSelectElement()
    },
    insertBeforeHandler() {
      this.targetDetermine()
      this.newRowHandler(
        this.targetIndex - 1,
        this.actionBeginIndex,
        this.actionEndIndex,
        true /*no transition*/
      )
    },
    insertAfterHandler() {
      this.targetDetermine()
      this.newRowHandler(
        this.targetIndex,
        this.actionBeginIndex,
        this.actionEndIndex,
        true /*no transition*/
      )
    },
    reviseInfoHandler() {
      this.targetDetermine()
    },
    actionDetermine() {
      this.actionBeginIndex = this.indexCache[0]
      this.actionEndIndex = this.indexCache[1]
    },
    targetDetermine() {
      this.targetIndex = this.indexCache[0]
    },
  },
}
