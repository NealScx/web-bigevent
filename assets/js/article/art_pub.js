$(function () {
    var layer = layui.layer
    var form = layui.form

    initCate()
    // 初始化富文本编辑器
    initEditor()

    // 定义加载文章类别的方法
    function initCate() {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('加载文章类别失败!')
                }
                // 调用模板引擎渲染分类的下拉菜单选项
                var htmlStr = template('tpl-table', res)
                $('[name=cate_id]').html(htmlStr)
                // 一定要调用 layui.form.render() 方法重新渲染表格
                form.render()
            }
        })
    }

    // cropper 相关
    // 1. 初始化图片裁剪器
    var $image = $('#image')
    // 2. 裁剪选项
    var options = {
        aspectRatio: 400 / 280,
        preview: '.img-preview'
    }
    // 3. 初始化裁剪区域
    $image.cropper(options)


    // 为选择封面的按钮,绑定点击事件处理函数
    $('#btnChooseImage').on('click', function () {
        $('#coverFile').click()
    })

    // 监听 coverFile 的 change 事件,获取用户上传的文件
    $('#coverFile').on('change', function (e) {
        // 获取到文件的列表数组
        const file = e.target.files
        // 判断用户是否上传了文件
        console.log(file.length);
        if (file.length === 0) {
            return layer.msg('取消选择')
        }
        // 根据文件,创建对应的 URL 地址
        var newImgURL = URL.createObjectURL(file[0])
        // 为裁剪区域重新设置区域
        $image
            .cropper('destroy') // 销毁旧的裁剪区域
            .attr('src', newImgURL) // 重新设置图片路径
            .cropper(options) // 重新初始化裁剪区域
    })

    // 定义文章的发布状态
    var art_state = '已发布'

    // 给草稿按钮绑定点击事件函数
    $('#btnSave2').on('click', function () {
        art_state = '草稿'
    })

    // 为表单绑定 submit 提交事件
    $('#form-pub').on('submit', function (e) {
        // 1.阻止默认提交行为
        e.preventDefault();

        // 2.基于 form 表单，快速创建一个 FormData 对象
        var fd = new FormData($(this)[0])

        // 3.将发布状态追加到 fd对象 中
        fd.append('state', art_state)

        // 4.将封面裁剪后的图片，输出为一个blob文件对象
        $image
            .cropper('getCroppedCanvas', { // 创建一个 Canvas 画布
                width: 400,
                height: 280
            })
            .toBlob(function (blob) { // 将 Canvas 画布上的内容，转化为文件对象

                // 5.将文件对象，存储到 fd 中
                fd.append('cover_img', blob)
                // 6.发起 ajax 请求
                publishArticle(fd)
            })
    })

    // 定义一个发布文章的方法
    function publishArticle(fd) {
        $.ajax({
            method: 'POST',
            url: '/my/article/add',
            data: fd,
            // 注意:如果提交的是 FormData 格式的数据 必须添加两个配置项
            contentType: false,
            processData: false,
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('发布失败!')
                }
                layer.msg('发布成功!')
                location.href = '/article/art_list.html'
            }
        })
    }
})