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
    },
    insertBeforeHandler() {
      this.targetDetermine()
    },
    insertAfterHandler() {
      this.targetDetermine()
    },
    reviseInfoHandler() {
      this.targetDetermine()
    },
    actionDetermine() {
      this.actionBeginIndex = this.indexCache[0]
      this.actionEndIndex = this.indexCache[1]
    },
    targetDetermine() {
      this.targetDetermine = this.indexCache[0]
    },
  },
}
