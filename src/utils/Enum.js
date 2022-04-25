const MoveCaseEnum = {
  CopyEvent: 'copyEvent',
  DeformationEvent: 'deformationEvent',
  SelectEvent: 'selectEvent',
  Default: 'deformationEvent',
}
const MenuEnum = {
  Delete: 'Delete',
  DeleteAll: 'DeleteAll',
  Copy: 'Copy',
  CopyAll: 'CopyAll',
  InsertBefore: 'InsertBefore',
  InsertAfter: 'InsertAfter',
  ReviseInfo: 'ReviseInfo',
}
const MenuAction = {
  Delete: 'deleteHandler',
  DeleteAll: 'deleteHandler',
  Copy: 'copyHandler',
  CopyAll: 'copyHandler',
  InsertBefore: 'insertBeforeHandler',
  InsertAfter: 'insertAfterHandler',
  ReviseInfo: 'reviseInfoHandler',
}
const MenuText = {
  Delete: '删除当前行',
  DeleteAll: '删除所选项',
  Copy: '复制当前行',
  CopyAll: '复制所选项',
  InsertBefore: '在此之前插入',
  InsertAfter: '在此之后插入',
  ReviseInfo: '修改信息',
}
export { MoveCaseEnum, MenuEnum, MenuAction, MenuText }
