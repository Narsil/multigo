(function(){
    var paper;
    var square_length;
    var socket = io.connect();
    var data = {'state':[
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]],
        'players':[
            {
                'name': 'Player 1',
                'color': '#000'
            },{
                'name': 'Player 2',
                'color': '#fff'
            },{
                'name': 'Player 3',
                'color': '#f00'
            }],
        'turn': 0
    };
    var player = 0;

    socket.on('data', function(msg){
        data = $.parseJSON(msg);
    });

    var put_stone = function(x, y){
        socket.emit('play', [x, y]);
    };

    var draw_stone = function(x, y, value){
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
                if(data.turn == player){
                    color = data.players[data.turn].color;
                    stone.hover(function(){
                        stone.attr('opacity', 0.5);
                    }, function(){
                        stone.attr('opacity', 0);
                    });
                    stone.click(function(){
                        put_stone(x, y);
                    });
                    stone.attr('opacity', 0);
                }
                break;
            default:
                color = data.players[value - 1].color;
                break;
        }
        stone.attr('fill', color);
        return stone;
    };

    var draw = function(){
        $('body svg').remove();
        var width = $(window).width();
        var height = $(window).height();
        var grid = data.state.length;

        var min = Math.min(width, height);

        paper = Raphael(0, 0, min, min);


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
        for (i = 0; i < data.state.length; i++){
            for (j = 0; j < data.state[i].length; j++){
                draw_stone(i, j, data.state[i][j]);
            }
        }

    };
    $(window).resize(function(){
        draw();
    });
    draw();
})();
