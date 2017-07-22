map = {
    76,205,205,205,205,205,205,205,205,12,0,0,0,13,0,141,0,0,0,76,205,205,205,205,12,76,205,205,205,205,12,
    13,1,1,2,1,1,1,1,1,141,0,0,0,13,0,141,0,0,0,13,1,1,1,2,141,13,1,1,1,1,141,
    13,1,75,77,11,1,75,11,1,141,0,0,0,13,0,141,0,0,0,13,1,75,11,1,139,203,1,75,11,1,141,
    13,1,141,0,13,1,141,13,1,141,0,0,0,13,0,141,0,0,0,13,1,141,13,1,1,1,1,141,13,1,141,
    13,1,141,0,13,1,141,13,1,141,0,0,0,13,0,141,0,0,0,13,1,141,140,77,77,11,1,141,13,1,141,
    13,1,139,205,203,1,139,203,1,139,205,205,205,203,0,139,205,205,205,203,1,139,205,205,205,203,1,141,13,1,141,
    13,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,141,13,1,141,
    13,1,75,77,11,1,75,77,77,77,77,77,77,11,0,75,77,77,77,11,1,75,11,1,75,77,77,204,13,1,141,
    13,1,141,0,13,1,139,205,205,12,76,205,205,203,0,139,205,205,205,203,1,141,13,1,139,205,205,12,13,1,141,
    13,1,141,0,13,1,1,1,1,141,13,0,0,0,0,0,0,0,0,0,1,141,13,1,1,1,1,141,13,1,141,
    13,1,141,0,13,1,75,11,1,141,13,0,79,78,78,78,15,0,75,11,1,141,13,1,75,11,1,141,13,1,141,
    13,1,139,205,203,1,141,13,1,139,203,0,142,0,0,0,14,0,141,13,1,139,203,1,141,13,1,139,203,1,141,
    13,1,1,1,1,1,141,13,1,0,0,0,142,0,0,0,14,0,141,13,1,1,1,1,141,13,1,1,1,1,141,
    140,77,77,77,11,1,141,140,77,77,11,0,73,0,0,0,14,0,141,140,77,77,11,0,141,140,77,77,11,1,141,
    76,205,205,205,203,1,141,76,205,205,203,0,73,0,0,0,14,0,141,76,205,205,203,0,141,76,205,205,203,1,141,
    13,1,1,1,1,1,141,13,1,0,0,0,142,0,0,0,14,0,141,13,1,1,1,1,141,13,1,1,1,1,141,
    13,1,75,77,11,1,141,13,1,75,11,0,142,0,0,0,14,0,141,13,1,75,11,1,141,13,1,75,11,1,141,
    13,1,141,0,13,1,139,203,1,141,13,0,143,206,206,206,207,0,139,203,1,141,13,1,139,203,1,141,13,1,141,
    13,1,141,0,13,1,1,1,1,141,13,0,0,0,0,0,0,0,0,0,1,141,13,1,1,1,1,141,13,1,141,
    13,1,141,0,13,1,75,77,77,204,140,77,77,11,0,75,77,77,77,11,1,141,13,1,75,77,77,204,13,1,141,
    13,1,139,205,203,1,139,205,205,205,205,205,205,203,0,139,205,205,205,203,1,139,203,1,139,205,205,12,13,1,141,
    13,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,141,13,1,141,
    13,1,75,77,11,1,75,11,1,75,77,77,77,11,0,75,77,77,77,11,1,75,77,77,77,11,1,141,13,1,141,
    13,1,141,0,13,1,141,13,1,141,0,0,0,13,0,141,0,0,0,13,1,141,76,205,205,203,1,141,13,1,141,
    13,1,141,0,13,1,141,13,1,141,0,0,0,13,0,141,0,0,0,13,1,141,13,1,1,1,1,141,13,1,141,
    13,1,139,205,203,1,139,203,1,141,0,0,0,13,0,141,0,0,0,13,1,139,203,1,75,11,1,139,203,1,141,
    13,1,1,2,1,1,1,1,1,141,0,0,0,13,0,141,0,0,0,13,1,1,1,2,141,13,1,1,1,1,141,
    140,77,77,77,77,77,77,77,77,204,0,0,0,13,0,141,0,0,0,140,77,77,77,77,204,140,77,77,77,77,204,
}

x_gap = 5
y_gap = 1

for y = 0, 27 do
    for x = 0, 30 do
        ex3.draw_static_sprite(map[x+y*31], 0, x+x_gap, y+y_gap)
    end
end

pacman_x = 16 * (x_gap + 23) - 8
pacman_y = 16 * (y_gap + 13)
pacman_rot = 1
pacman_anim = 0
pacman_spd = 4
pacman_died = 0

enemy_spd = 4
enemy1_x = 16 * (x_gap + 11) - 8
enemy1_y = 16 * (y_gap + 13)
enemy1_rot = 3
enemy2_x = 16 * (x_gap + 10) - 8
enemy2_y = 16 * (y_gap + 13)
enemy3_x = 16 * (x_gap + 10) - 8
enemy3_y = 16 * (y_gap + 13)
enemy4_x = 16 * (x_gap + 10) - 8
enemy4_y = 16 * (y_gap + 13)
enemy_x = {248, 296, 296, 296}
enemy_y = {224, 200, 224, 248}
enemy_rot = {2, 1, 0, 2}
enemy_index = 0

small_score = 0

function walkable(x, y)
    x = ((x + 8) >> 4) - x_gap
    y = ((y + 8) >> 4) - y_gap
    m = map[x+y*31] & (64+8)
    return m == 0
end

function turnable(x, y)
    x = x - (x >> 4) * 16
    y = y - (y >> 4) * 16
    return x == 8 and y == 8
end

function pacman_move()
    -- アニメーション
    pacman_anim = pacman_anim + 1
    if pacman_anim > 3 then
        pacman_anim = 0
    end
    
    -- ○をとる
    x = ((pacman_x + 16) >> 4) - x_gap
    y = ((pacman_y + 16) >> 4) - y_gap
    m = map[x+y*31]
    if m == 1 or m == 2 then
        map[x+y*31] = m+32
        ex3.draw_static_sprite(m+32, 0, x+x_gap, y+y_gap)
        if m == 1 then
            small_score = small_score + 1
        end
    end
end

function enemy_move(index)
    x = enemy_x[index]
    y = enemy_y[index]
    rot = enemy_rot[index]
    if rot == 0 and walkable(x-1, y) then
        enemy_x[index] = x - enemy_spd
    elseif rot == 1 and walkable(x, y+16+1) then
        enemy_y[index] = y + enemy_spd
    elseif rot == 2 and walkable(x, y-1) then
        enemy_y[index] = y - enemy_spd
    elseif rot == 3 and walkable(x+16+1, y) then
        enemy_x[index] = x + enemy_spd
    else
        enemy_rot[index] = ex3.get_random() % 4
    end
end
        
        
    

while 1 do
    if turnable(pacman_x, pacman_y) then
        key_r, key_u, key_d, key_l = ex3.get_key_state()
        if key_r and walkable(pacman_x+16+1, pacman_y) then
            pacman_rot = 2
        elseif key_u and walkable(pacman_x, pacman_y-1) then
            pacman_rot = 3
        elseif key_d and walkable(pacman_x, pacman_y+16+1) then
            pacman_rot = 1
        elseif key_l and walkable(pacman_x-1, pacman_y) then
            pacman_rot = 0
        end
    end
    
    if pacman_rot == 2 and walkable(pacman_x+16+1, pacman_y) then
        pacman_x = pacman_x + pacman_spd
        pacman_move()
    elseif pacman_rot == 3 and walkable(pacman_x, pacman_y-1) then
        pacman_y = pacman_y - pacman_spd
        pacman_move()
    elseif pacman_rot == 1 and walkable(pacman_x, pacman_y+16+1) then
        pacman_y = pacman_y + pacman_spd
        pacman_move()
    elseif pacman_rot == 0 and walkable(pacman_x-1, pacman_y) then
        pacman_x = pacman_x - pacman_spd
        pacman_move()
    end
    
    anim_index = pacman_anim
    if anim_index == 3 then anim_index = 1 end
    ex3.draw_dynamic_sprite(8*2+anim_index, pacman_rot, pacman_x, pacman_y, 0)
    
    for i = 0, 3 do
       enemy_move(i)
       ex3.draw_dynamic_sprite(8*7+i*2, 0, enemy_x[i], enemy_y[i], i*2+1)
       ex3.draw_dynamic_sprite(8*6+enemy_rot[i], 0, enemy_x[i], enemy_y[i], i*2+2)
    end
    
    ex3.sleep()
end
