
//1、遍历imgObj，动态创建img对象，然后指定其src为遍历到的地址，以加载图片
//2、在加载图片时，需要监听每一张img的onload事件
//当所有图片都出发onload事件后，调用回调函数，把加载的资源传递过去。
function loadImage(imgUrl, fn){
    //存储图片资源的对象
    var imgObj = {};
    //临时文件存储
    var tempImg;
    //记录加载完毕的图片数量
    var loaded = 0;
    //统计要加载的图片数量
    var imgLength = 0;
    //遍历所有url，动态创建img
    for(var key in imgUrl){
        imgLength++;//每次遍历要加载的图片数+1
        //根据遍历到的url，加载图片
        tempImg = new Image();
        //监听onload
        tempImg.onload = function(){
            loaded++;
            //当图片加载的数量大于等于需要加载的数量，就可以执行回调
            if(loaded >= imgLength){
                fn(imgObj); 
            }
        };
        tempImg.src = imgUrl[key];
        //把当前加载的图片存储起来
        imgObj[key] = tempImg;
    }
}

//loadimage测试
// loadImage({
//     red:url,
//     blue:url2,
//     man:url3,
// },function(ingObj){
//     ctx.drawImage(imgObj.red,10,10,100,100);
//     ctx.drawImage(imgObj.blue,10,10,100,100);
//     ctx.drawImage(imgObj.man,10,10,100,100);
// });


//绘制背景
//constructor{sky} 背景构造函数
//param{ctx:context}绘制环境
//param{img:Image}背景图像
//param{speed:number}背景速度

function Sky(ctx,img,speed) { 
    this.ctx = ctx;
    this.img = img;
    this.width = this.img.width;
    this.height = this.img.height;
    this.speed = speed||2;

    //创建一个实例，length自增
    Sky.len++;
    //根据背景的数量，动态计算起始的X轴坐标
    this.x = this.width*(Sky.len - 1);
    this.y = 0;

 }
//sky实例默认的数量
Sky.len = 0;
//原型扩充方法
Sky.prototype = {
     constructor: Sky,
     //绘制背景
     draw: function(){
         this.ctx.drawImage(this.img, this.x, this.y);
     },

     updata: function () { 
         this.x -= this.speed;
         if(this.x <= -this.width){
             this.x += this.width*Sky.len;
         }
      }

}


//constructor{Bird}鸟构造函数
//param{ctx:context}绘图环境
//param{img:Image}鸟图
//param{widthFrame:number}一排的帧数
//param{heightFrame:number}一列的帧数
//param{x:number}鸟的起始X坐标
//param{y:number}鸟的起始y坐标
function Bird(ctx, img, widthFrame, heightFrame, x, y) { 
    this.ctx = ctx;
    this.img = img;
    this.widthFrame = widthFrame;
    this.heightFrame = heightFrame;
    this.x = x;
    this.y = y;

    //一个小鸟的宽高
    this.width = this.img.width / this.widthFrame;
    this.height = this.img.height / this.heightFrame;

    //当前小鸟渲染的帧数、
    this.currentFrame = 0;

    //小鸟的下落速度
    this.speed = 2;
    this.speedPlus = 0.7;//下落加速度

    //绑定事件
    this._bind();
 }

 //给原型扩展方法
Bird.prototype = {
    constructor: Bird,

    //绘制鸟
    draw: function () {
        //角加速度
        var rotateRadian = 0;
        //当下落速度为1时，旋转10度
        var baseRadian = Math.PI / 180 * 5;
        rotateRadian = baseRadian * this.speed;
        if(rotateRadian >= Math.PI / 180 * 70){
            rotateRadian = Math.PI / 180 * 70;
        }
        //让小鸟上下飞的时候旋转一定角度，先保存状态避免影响其他画布元素
        this.ctx.save();
        //1.先将坐标系移动到 小鸟中心点
        //2.根据上下速度旋转坐标系
        //3.绘制小鸟（注意绘制的坐标需要像左上角平移，xy坐标为负的宽高一半）
        this.ctx.translate(this.x+this.width/2, this.y+this.height/2);
        this.ctx.rotate(rotateRadian);
        
        
        this.ctx.drawImage(this.img,
            this.width*this.currentFrame, 0, this.width, this.height,
            -this.width/2, -this.height/2, this.width, this.height);
        this.ctx.restore();

      },

    //计算下一帧绘制的数据
    updata: function () { 
          this.currentFrame = ++this.currentFrame >= this.widthFrame? 0 : this.currentFrame;
          //小鸟有加速度的下落
          this.y += this.speed;
          this.speed += this.speedPlus;
          
       },
    
    //绑定事件
    _bind: function(){
        var self = this;
        this.ctx.canvas.addEventListener("click", function(){
            self.speed = -6;
        });
    }


}


//大地
//constructor{land}大地构造函数
//param{ctx:context}绘图环境
//param{img:Image}大地图片
//param{speed:number}速度

function Land(ctx, img, speed){
    this.ctx = ctx;
    this.img = img;
    this.speed = speed ||2;
    //坐标定位
    // this.x = 0;
    // this.y = this.ctx.canvas.height - this.img.height;
    //创建一个实例，length自增
    Land.len++;
    //根据背景的数量，动态计算起始的X轴坐标
    this.x = this.img.width * (Land.len - 1);
    this.y = this.ctx.canvas.height - this.img.height;
}

//Land实例默认的数量
Land.len = 0;

extend(Land.prototype,{
    draw: function () {
        this.ctx.drawImage(this.img, this.x, this.y);
    },
    updata: function (){
        this.x -= this.speed;
        this.x += this.x <= -this.img.width?this.img.width*Land.len : 0;
        // if(this.x <= -this.img.width){
        //     this.x += this.img.width*Land.len;
        // }
    }
})

//管道
//特点：1.成对出现，X轴坐标共享，Y轴不共享
//2.管道上下之间的路径固定，可以由用户指定
//3.管道高度随机生成，随机生成一边管道的高度，另一边计算可得
//4.管道走出画布，总右边出来时，高度需要重新随机生成
//constructor{pipe}管道构造函数
//param{ctx:context}绘图环境
//param{imgDown:Image}管道口朝下图片，在画布上方
//param{imgUp:Image}灌南道口朝上图片，在画布下方
//param{space:number}上下管道间距
//param{speed:number}速度

function Pipe(ctx, imgDown, imgUp, landHeight, space, speed ) { 
    this.ctx = ctx;
    this.imgDown = imgDown;
    this.imgUp = imgUp;
    this.space = space;
    this.speed = speed;
    this.landHeight = landHeight;

    //管道默认的宽高
    this.width = this.imgDown.width;
    this.height = this.imgDown.height;

    this.x = 400 + this.width*3*(Pipe.len-1);
    this.y = 0;
    Pipe.len++;
    //初始化管道坐标
    this._init();
    
}

Pipe.len = 0;

extend(Pipe.prototype,{
    //初始化管道的坐标
    _init: function () { 
        //最大高度为画布高-地面高-自定义最小高度
        var maxHeight = this.ctx.canvas.height - this.landHeight - this.space-70;
        //随机生成管道高度
        var randomHeight = Math.random() *maxHeight;
        randomHeight = randomHeight<50?50:randomHeight;
        //上方管道的y轴坐标 = 随机高度 - 管道图片的默认高度
        this.downY = randomHeight - this.height;
        //求下边管道的y坐标= 随机生成的高度+上下管道间隔
        this.upY = randomHeight + this.space;
    },

    draw: function () { 
         this.ctx.drawImage(this.imgDown, this.x, this.downY);
         this.ctx.drawImage(this.imgUp, this.x, this.upY);
         this._drawPath();
    },

    //根据管道的宽高坐标绘制管道的路径
    _drawPath: function (){
        this.ctx.rect(this.x, this.downY, this.width, this.height);
        this.ctx.rect(this.x, this.upY, this.width, this.height);
        // this.ctx.stroke();
        
    },

 
    //管道也动起来
    updata: function () {  
        this.x -= this.speed;
        //管道走出画布从右侧进来，重新初始化
        if(this.x <= -this.width){
            this._init();
            this.x += this.width*3*Pipe.len;
        }
        
    }

})


loadImage({
    bird:"img/bird.png",
    land:"img/land.png",
    pipeDown:"img/pipe_down.png",
    pipeUp:"img/pipe_up.png",
    sky:"img/sky.png",
    },
    function(imgObj){
        //根据背景大小设置画布的大小
        cvs.width = imgObj.sky.width;
        cvs.height = imgObj.sky.height;

        //创建背景，背景不间断轮播需要2块背景
    
        var sky = new Sky(ctx, imgObj.sky, 5);
        var sky2 = new Sky(ctx, imgObj.sky, 5);
        //创建大地
        var land = new Land(ctx, imgObj.land, 5);
        var land2 = new Land(ctx, imgObj.land, 5);
        var land3 = new Land(ctx, imgObj.land, 5);


        //创建管道
        var pipe = new Pipe(ctx, imgObj.pipeDown, imgObj.pipeUp, imgObj.land.height, 100, 5 );
        var pipe2 = new Pipe(ctx, imgObj.pipeDown, imgObj.pipeUp, imgObj.land.height, 100, 5 );
        var pipe3 = new Pipe(ctx, imgObj.pipeDown, imgObj.pipeUp, imgObj.land.height, 100, 5 );
        var pipe4 = new Pipe(ctx, imgObj.pipeDown, imgObj.pipeUp, imgObj.land.height, 100, 5 );
        var pipe5 = new Pipe(ctx, imgObj.pipeDown, imgObj.pipeUp, imgObj.land.height, 100, 5 );
        // var pipe6 = new Pipe(ctx, imgObj.pipeDown, imgObj.pipeUp, imgObj.land.height, 100, 5 );

        //创建鸟
        var bird = new Bird(ctx, imgObj.bird, 3, 1, 10, 10);

    
        var timer = setInterval(function () {
            //每次绘制新的画面时，先判断小鸟有没有碰撞管道，或者飞出天空或者掉下大地，如果撞了停止计时器
            var birdCoreX = bird.x + bird.width/2;
            var birdCoreY = bird.y + bird.height/2;
            if(ctx.isPointInPath(birdCoreX, birdCoreY)
                ||birdCoreY < 0
                ||birdCoreY >ctx.canvas.width-imgObj.land.height){
                clearInterval(timer);
                ctx.fillStyle = "rgba(100, 100, 100, 0.8)";
                ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'red';
                ctx.font = '900 60px microsoft yahei';
                ctx.fillText("GAME OVER!!!", ctx.canvas.width/2, ctx.canvas.height/2);
                return;
            }

            //让背景动起来
            sky.draw();
            sky.updata();
            sky2.draw();
            sky2.updata();
            
            //管道
            //先清除上一次的管道路径，再绘制下一帧的路径
            ctx.beginPath();
            
            pipe.draw();
            pipe.updata();
            pipe2.draw();
            pipe2.updata();
            pipe3.draw();
            pipe3.updata();
            pipe4.draw();
            pipe4.updata();
            pipe5.draw();
            pipe5.updata();
            // pipe6.draw();
            // pipe6.updata();
            

            //大地
            land.draw();
            land.updata();
            land2.draw();
            land2.updata();
            land3.draw();
            land3.updata();
            
            //鸟
            bird.draw();
            bird.updata();

        },50);
    });



//混入式继承
function extend(o1, o2 ) { 
    for (var key in o2) {
        if(o2.hasOwnProperty(key)){
            o1[key] = o2[key];
        }
    }
    
 }