$(function () {
    var layer = layui.layer
    var form = layui.form
    var laypage = layui.laypage;

    // 定义美化时间的过滤器
    template.defaults.imports.dataFormat = function (date) {
        const dt = new Date(date)

        var y = dt.getFullYear()
        var m = padZero(dt.getMonth() + 1)
        var d = padZero(dt.getDate())

        var hh = padZero(dt.getHours())
        var mm = padZero(dt.getMinutes())
        var ss = padZero(dt.getSeconds())

        return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss
    }

    // 定义补零函数
    function padZero(n) {
        return n > 9 ? n : '0' + n
    }



    // 定义一个查询的参数对象，将来请求数据的时候
    // 需要将请求参数对象提交到服务器
    var q = {
        pagenum: 1,  // 默认请求第一页的数据
        pagesize: 2, // 每页显示几条数据,默认请求5条数据
        cate_id: '', // 文章分类的id
        state: '',   // 文章的发布状态
    }

    initTable()
    initCate()
    // 获取文章列表数据得方法
    function initTable() {
        $.ajax({
            method: 'GET',
            url: '/my/article/list',
            data: q,
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('获取文章列表数据失败!')
                }
                // 使用模板引擎渲染页面的数据
                // console.log(res);
                var htmlStr = template('tpl-table', res)
                $('tbody').html(htmlStr)
                // 调用渲染分页的方法
                renderPage(res.total)
            }
        })
    }


    // 获取文章分类的数据的方法
    function initCate() {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('获取分类数据失败!')
                }
                // 调用模板引擎渲染分类的可选项
                var htmlStr = template('tpl-cate', res)
                $('[name=cate_id]').html(htmlStr)
                form.render()
            }
        })
    }

    // 为筛选表单绑定 submit 事件
    $('#form-search').on('submit', function (e) {
        e.preventDefault();
        // 获取表单中选中项的值
        var cate_id = $('[name=cate_id]').val()
        var state = $('[name=state]').val()
        // 为查询参数对象 q 中对应的属性赋值
        q.cate_id = cate_id
        q.state = state
        // 根据最新的筛选条件重新渲染表格数据
        initTable()
    })

    // 定义渲染分页的方法
    function renderPage(total) {
        // 调用 laypage.render() 方法来渲染分页的结构
        laypage.render({
            elem: 'pageBox', //注意，这里的 test1 是 ID，不用加 # 号
            count: total, //数据总数，从服务端得到
            limit: q.pagesize, //每页显示几条数据
            curr: q.pagenum, //默认显示第几页数据
            layout: ['count', 'limit', 'prev', 'page', 'next', 'skip'],
            limits: [2, 3, 5, 10],  // 切换时会触发jump回调
            // 发生切换分页的时候,触发jump回调
            // 调用 laypage.render() 会触发jump回调 first为true
            jump: function (obj, first) {
                // console.log(obj.curr);
                // console.log(first);
                // 获取最新的页数赋值给q.pagenum属性中
                q.pagenum = obj.curr
                // 获取最新的每页显示条数赋值给q.pagesize属性中
                q.pagesize = obj.limit
                if (!first) {
                    // 重新渲染表格
                    initTable()
                }
            }
        });
    }

    // 通过事件代理的方式给删除按钮绑定点击事件
    $('tbody').on('click', '.btn-delete', function (e) {
        // 获取删除按钮的个数
        var len = $('.btn-delete').length
        console.log(len);
        // 获取到文章的 id
        var id = $(this).attr('data-id')
        layer.confirm('确认删除吗?', { icon: 3, title: '警告' }, function (index) {
            $.ajax({
                method: 'GET',
                // url: 'my/article/delete/:id',
                url: '/my/article/delete/' + id,
                success: function (res) {
                    if (res.status !== 0) {
                        return layer.msg('删除失败!')
                    }
                    layer.msg('删除成功!')
                    // 当数据删除完成后,需要判断当前页面是否还有剩余数据,如果没有剩余数据 则页码值需要 -1 之后再重新初始化表格
                    if (len === 1) {
                        // 如果只剩一个删除按钮时,页码值-1
                        // 页码值最小为1 不能为0 
                        q.pagenum = q.pagenum === 1 ? 1 : q.pagenum - 1
                    }
                    initTable()
                }
            })
            layer.close(index);
        });
    })
})