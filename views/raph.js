(function(){
    var paper;
    var square_length;
    var colors = {
        1: '#fff',
        2: '#000',
        3: '#f00'
    };

    var put_stone = function(x, y, value){
        var real_x = (x + 1) * square_length;
        var real_y = (y + 1) * square_length;
        var radius = square_length/2.2;
        var stone = paper.circle(real_x, real_y, radius);
        stone.attr('stroke-opacity', 0);
        var color;
        
        switch(value){
            case -1:
                break;
            case 0:
                color = '#fff';
                stone.hover(function(){
                    stone.attr('opacity', 0.5);
                }, function(){
                    stone.attr('opacity', 0);
                });
                stone.attr('opacity', 0);
                break;
            default:
                color = colors[value];
                break;
        }
        stone.attr('fill', color);
        return stone;
    };

    var draw = function(){
        $('body').empty();
        var width = $(window).width();
        var height = $(window).height();
        var grid = 9;

        paper = Raphael(0, 0, width, height);

        var rect = paper.rect(0, 0, width, height);

        var square_height = height/(grid + 1);
        var square_width = width/(grid + 1);

        square_length = Math.min(square_height, square_width);

        for(i = 1; i < grid; i++){
            for(j = 1; j < grid; j++){
                paper.rect(i * square_length, j * square_length, square_length, square_length);
            }
        }
        rect.attr('fill', '#ccc');
        for (i = 0; i < grid; i++){
            for (j = 0; j < grid; j++){
                put_stone(i, j, 0);
            }
        }

    };
    $(window).resize(function(){
        draw();
    });
    draw();
    put_stone(0, 0, 1);
    put_stone(1, 1, 1);

    put_stone(0, 1, 2);
    put_stone(6, 2, 2);

    put_stone(5, 6, 3);
    put_stone(7, 5, 3);
})();
