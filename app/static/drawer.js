window.addEventListener("load", function(){

    var canvas = $("#canvas").get(0);
    var touchableDevice = ('ontouchstart' in window);

    if (canvas.getContext){

        var context = canvas.getContext('2d');

        var drawing = false;
        var prev = {};

        canvas.width = 2 * $("#canvas").width();
        canvas.height = 2 * $("#canvas").height();
        context.scale(2.0, 2.0);

        context.lineJoin = "round";
        context.lineCap = "round";
        context.lineWidth = 20;
        context.strokeStyle = 'rgb(0,0,0)';

        $("#canvas").bind('touchstart mousedown', function(e) {
            e.preventDefault();
            prev = getPointOnCanvas(this, event, e);
            drawing = true;
        });

        $("#canvas").bind('touchmove mousemove', function(e) {
            if(drawing == false) return;

            e.preventDefault();
            curr = getPointOnCanvas(this, event, e);

            // draw
            context.beginPath();
            context.moveTo(prev.x, prev.y);
            context.lineTo(curr.x, curr.y);
            context.stroke();

            // update
            prev = curr;
        });

        $("#canvas").bind('touchend mouseup mouseleave', function(e) {
            drawing = false;
            estimate(context);
        });

        var getPointOnCanvas = function(elem, windowEvent, touchEvent ) {
            return {
                x : (touchableDevice ? windowEvent.changedTouches[0].clientX : touchEvent.clientX ) - $(elem).offset().left,
                y : (touchableDevice ? windowEvent.changedTouches[0].clientY : touchEvent.clientY ) - $(elem).offset().top
            };
        };

        $("#delete_button").click(function(){
            context.clearRect(0,0,280,280);
        });

        var estimate = function(context) {
            var img_buf = getImageBuffer(context, 28, 28);
            $.ajax({
                type:"post",
                url:"/estimate",
                data: JSON.stringify({"input": img_buf}),
                contentType: 'application/json',
                success: function(result) {
                    console.log(result);
                    $("#estimated").text("Estimated = " + result.estimated);
                }
            });
        };

        var getImageBuffer = function(context, width, height) {
            var tmpCanvas = $('<canvas>').get(0);
            tmpCanvas.width = width;
            tmpCanvas.height = height;
            var tmpContext = tmpCanvas.getContext('2d');
            tmpContext.drawImage(context.canvas, 0, 0, width, height);
            var image = tmpContext.getImageData(0,0,width,height);

            var buffer = []
            for( var i = 0; i < image.data.length; i += 4 ) {
                var sum = image.data[i+0] + image.data[i+1] + image.data[i+2] + image.data[i+3];
                buffer.push(Math.min(sum,255));
            }
            return buffer;
        };

    }
}, false);
