var contains = function(list, coord){
    for (var i = 0; i < list.length; i++){
        if(coord[0] == list[i][0] && coord[1] == list[i][1]){
            return true;
        }
    }
    return false;
};

var take_stone_if = function(state, x, y, checked){
    var should_check = [];
    for (var i=0;i<4;i++){
        switch(i){
            case 0:
                ix = x-1;
                iy = y;
                break;
            case 1:
                ix = x;
                iy = y-1;
                break;
            case 2:
                ix = x+1;
                iy = y;
                break;
            case 3:
                ix = x;
                iy = y+1;
                break;
        }
        if (state[ix] === undefined || state[ix][iy] === undefined){
            continue;
        }else if(state[ix][iy] <= 0){
            return {'state': state, 'taken':false};
        }else if (contains(checked, [ix, iy]) || state[ix][iy] != state[x][y]){
            continue;
        }else if (state[ix][iy] == state[x][y]){
            should_check.push([ix, iy]);
        }
    }
    checked.push([x, y]);
    var taken = true;
    var coord;
    for (i = 0; i < should_check.length; i++){
        coord = should_check[i];
        ix = coord[0];
        iy = coord[1];
        var take_status = take_stone_if(state, ix, iy, checked);
        taken =  take_status.taken;
    }
    if (taken){
        for (i = 0; i < checked.length; i++){
            coord = checked[i];
            var lx = coord[0];
            var ly = coord[1];
            state[lx][ly] = 0;
        }
    }
    return {'state': state, 'taken':true};
};

var check_stone = function(state, x, y, ix, iy){
    if (state[ix] === undefined || state[ix][iy] === undefined || state[ix][iy] === 0 || state[ix][iy] == state[x][y]){
        return state;
    }else{
        taken_status = take_stone_if(state, ix, iy, []);
        state = taken_status.state;
    }
    return state;
};

exports.update_state = function(state, x, y, player){
    if (state[x] === undefined || state[x][y] !== 0){
        return;
    }
    state[x][y] = player;
    state = check_stone(state, x, y, x-1, y);
    state = check_stone(state, x, y, x, y-1);
    state = check_stone(state, x, y, x+1, y);
    state = check_stone(state, x, y, x, y+1);
    return state;
};

