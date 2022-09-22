$(function () {
    var layer = layui.layer
    var form = layui.form

    initArtCateList()
    // 获取文章分类的列表
    function initArtCateList() {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('加载失败!')
                }
                let htmlStr = template('tpl-table', res)
                $('tbody').html(htmlStr)
            }
        })
    }

    // 设置弹出层索引
    var indexAdd = null
    $('#btnAddCate').on('click', function () {
        // 点击按钮弹出添加的层
        indexAdd = layer.open({
            type: 1,
            area: ['500px', '250px'],
            title: '添加文章分类',
            content: $('#dialog-add').html()
        });
    })

    // 通过代理的形式为 form-add 表单绑定 submit 事件
    $('body').on('submit', '#form-add', function (e) {
        e.preventDefault();
        $.ajax({
            method: 'POST',
            url: '/my/article/addcates',
            data: $(this).serialize(),
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('添加分类失败!')
                }
                initArtCateList()
                layer.msg('添加分类成功!')
                // 根据索引关闭弹出层
                layer.close(indexAdd)
            }
        })
    })

    // 通过代理的形式为 btn-edit 表单绑定 click 事件
    // 设置弹出层索引
    var indexEdit = null
    $('tbody').on('click', '.btn-edit', function () {
        // 点击按钮弹出编辑的层
        indexEdit = layer.open({
            type: 1,
            area: ['500px', '250px'],
            title: '修改文章分类',
            content: $('#dialog-edit').html()
        });

        var id = $(this).attr('data-id')

        // 发起请求获取对应分类的数据
        $.ajax({
            method: 'GET',
            url: '/my/article/cates/' + id,
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('获取原数据失败!')
                }
                // console.log(res.data);
                form.val('form-edit', res.data)
            }
        })
    })

    // 通过代理的形式为 form-edit 表单绑定 submit 事件
    $('body').on('submit', '#form-edit', function (e) {
        e.preventDefault()
        console.log($(this).serialize());
        $.ajax({
            method: 'POST',
            url: '/my/article/updatecate',
            data: $(this).serialize(),
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('修改失败!')
                }
                layer.msg('修改成功!')
                layer.close()
                initArtCateList()
            }
        })
    })

    // 通过代理的形式为 btn-del 表单绑定 click 事件
    $('tbody').on('click', '.btn-del', function () {
        var id = $(this).attr('data-id')
        // 提示用户是否删除
        layer.confirm('确定删除吗?', { icon: 3, title: '警告' }, function (index) {
            $.ajax({
                method: 'GET',
                url: '/my/article/deletecate/' + id,
                success: function (res) {
                    if (res.status !== 0) {
                        return layer.msg('删除失败!')
                    }
                    layer.msg('删除成功!')
                    layer.close(index)
                    initArtCateList()
                }
            })
        });
    })
})