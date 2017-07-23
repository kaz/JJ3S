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

pacman_x = 0
pacman_y = 0
pacman_rot = 0
pacman_anim = 0

pacman_spd = 4
pacman_died = 0

enemy_spd = 4
enemy_spd_half = enemy_spd >> 1
enemy_x = {248, 296, 296, 296}
enemy_y = {224, 224, 200-8, 248+8}
enemy_rot = {2, 3, 0, 0}
enemy_state = {0, 0, 0, 0} -- weak:1, dead:2
enemy_count = 1
enemy_out = 0
weak_timer = 0

small_score = 0
small_amount = 240

cleared = 0
timer = 0

enemy_walk_mode = 0

function walkable(x, y)
    x = ((x + 8) >> 4) - x_gap
    y = ((y + 8) >> 4) - y_gap
    m = map[x+y*31] & (64+8)
    return m == 0 and (enemy_walk_mode == 0 or x ~= 14 or (y ~= 5 and y ~= 22))
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
            if small_score == small_amount then
                cleared = 1
            end
        elseif m == 2 then
            for i = 0, 3 do
                enemy_state[i] = 1
                weak_timer = 1
            end
        end
    end

    -- 上下ワープ
    if pacman_x == 216 + x_gap * 16 then -- center
        if pacman_y == 424 + y_gap * 16 and pacman_rot == 1 then
           pacman_y = -8 + y_gap * 16
        end
        if pacman_y == -8 + y_gap * 16 and pacman_rot == 3 then
           pacman_y = 440 + y_gap * 16
        end
    end
end

function flash_item(x, y)
    if map[x+y*31] == 0 or timer & 4 then
        c = 0
    else
        c = map[x+y*31]
    end
    ex3.draw_static_sprite(c, 0, x+x_gap, y+y_gap)
end

function enemy_move(index)
    enemy_walk_mode = 1
    x = enemy_x[index]
    y = enemy_y[index]
    oldrot = enemy_rot[index]
    if turnable(x, y) then
        newrot = ex3.get_random() & 3
        if newrot + oldrot == 3 then
        elseif newrot == 0 and walkable(x-1, y) then
            enemy_rot[index] = newrot
        elseif newrot == 1 and walkable(x, y+(16+1)) then
            enemy_rot[index] = newrot
        elseif newrot == 2 and walkable(x, y-1) then
            enemy_rot[index] = newrot
        elseif newrot == 3 and walkable(x+(16+1), y) then
            enemy_rot[index] = newrot
        end
    end
    rot = enemy_rot[index]
    if rot == 0 and walkable(x-1, y) then
        enemy_x[index] = x - enemy_spd
    elseif rot == 1 and walkable(x, y+(16+1)) then
        enemy_y[index] = y + enemy_spd
    elseif rot == 2 and walkable(x, y-1) then
        enemy_y[index] = y - enemy_spd
    elseif rot == 3 and walkable(x+(16+1), y) then
        enemy_x[index] = x + enemy_spd
    else
        enemy_rot[index] = ex3.get_random() & 3
    end
    enemy_walk_mode = 0
end

function enemy_out_anim(index)
    x = enemy_x[index]
    y = enemy_y[index]
    if y == 224 then -- at gate
        if x == 248 then
            enemy_count = enemy_count + 1
            enemy_out = 0
        else
            enemy_x[index] = x - enemy_spd_half
            enemy_rot[index] = 0
        end
    elseif y < 224 then
        enemy_y[index] = y + enemy_spd_half
        enemy_rot[index] = 1
    else
        enemy_y[index] = y - enemy_spd_half
        enemy_rot[index] = 2
    end
end

function enemy_wait(index)
    x = enemy_x[index]
    y = enemy_y[index]
    rot = enemy_rot[index]
    if rot == 0 and walkable(x-9, y) then
        enemy_x[index] = x - enemy_spd_half
    elseif rot == 3 and walkable(x+(16+9), y) then
        enemy_x[index] = x + enemy_spd_half
    else
        enemy_rot[index] = 3 - rot
    end
end

function ishit(pacman_x, pacman_y)
    for i = 0, 3 do
        tmp=enemy_x[i]+enemy_y[i]-pacman_x-pacman_y
        if tmp<5 and tmp>-5 then
           goto gameover
        end
    end
end

function Edebuff()
end

function restart_enemy()
    enemy_x[0] = 248
    enemy_x[1] = 296
    enemy_x[2] = 296
    enemy_x[3] = 296
    enemy_y[0] = 224
    enemy_y[1] = 224
    enemy_y[2] = 200-8
    enemy_y[3] = 248+8
    enemy_rot[0] = 2
    enemy_rot[1] = 3
    enemy_rot[2] = 0
    enemy_rot[3] = 0
    enemy_state[0] = 0
    enemy_state[1] = 0
    enemy_state[2] = 0
    enemy_state[3] = 0
    enemy_count = 1
    enemy_out = 0
    weak_timer = 0
end

-- Main routine

for y = 0, 27 do
    for x = 0, 30 do
        ex3.draw_static_sprite(map[x+y*31], 0, x+x_gap, y+y_gap)
    end
end

::restart::

pacman_x = 16 * (x_gap + 23) - 8
pacman_y = 16 * (y_gap + 13)
pacman_rot = 1
pacman_anim = 0

restart_enemy()

ex3.draw_dynamic_sprite(8*2, pacman_rot, pacman_x, pacman_y, 8)
for i = 0, 3 do
    ex3.draw_dynamic_sprite(8*7+i*2, 0, enemy_x[i], enemy_y[i], i*2)
    ex3.draw_dynamic_sprite(8*6+enemy_rot[i], 0, enemy_x[i], enemy_y[i], i*2+1)
end

-- READY
for i = 0, 4 do
    ex3.draw_static_sprite(3+i, 0, i+(12+x_gap), 18+y_gap)
end

for t = 0, 60 do
    ex3.sleep()
end

-- remove READY
for i = 0, 4 do
    ex3.draw_static_sprite(0, 0, i+(12+x_gap), 18+y_gap)
end

timer = 0
while 1 do
    -- receive input
    if turnable(pacman_x, pacman_y) then
        key_r, key_u, key_d, key_l = ex3.get_key_state()
        if key_r and walkable(pacman_x+(16+1), pacman_y) then
            pacman_rot = 2
        elseif key_u and walkable(pacman_x, pacman_y-1) then
            pacman_rot = 3
        elseif key_d and walkable(pacman_x, pacman_y+(16+1)) then
            pacman_rot = 1
        elseif key_l and walkable(pacman_x-1, pacman_y) then
            pacman_rot = 0
        end
    end

    -- move pacman
    if pacman_rot == 2 and walkable(pacman_x+(16+1), pacman_y) then
        pacman_x = pacman_x + pacman_spd
        pacman_move()
    elseif pacman_rot == 3 and walkable(pacman_x, pacman_y-1) then
        pacman_y = pacman_y - pacman_spd
        pacman_move()
    elseif pacman_rot == 1 and walkable(pacman_x, pacman_y+(16+1)) then
        pacman_y = pacman_y + pacman_spd
        pacman_move()
    elseif pacman_rot == 0 and walkable(pacman_x-1, pacman_y) then
        pacman_x = pacman_x - pacman_spd
        pacman_move()
    end

    -- flash item
    flash_item(3, 1)
    flash_item(3, 26)
    flash_item(23, 1)
    flash_item(23, 26)

    -- draw pacman
    anim_index = pacman_anim
    if anim_index == 3 then anim_index = 1 end
    ex3.draw_dynamic_sprite(8*2+anim_index, pacman_rot, pacman_x, pacman_y, 8)

    -- process enemy
    for i = 0, 3 do
        if i < enemy_count then
            enemy_move(i)
        elseif i == enemy_count and enemy_out then
            enemy_out_anim(i)
        else
            enemy_wait(i)
        end
        if enemy_state[i]==0 or (enemy_state[i]==1 and weak_timer >= 200 and weak_timer & 8) then -- normal
            ex3.draw_dynamic_sprite(8*7+i*2+((timer>>1)&1), 0, enemy_x[i], enemy_y[i], i*2)
            ex3.draw_dynamic_sprite(8*6+enemy_rot[i], 0, enemy_x[i], enemy_y[i], i*2+1)
        else -- weak
            ex3.draw_dynamic_sprite(52+((timer>>1)&1), 0, enemy_x[i], enemy_y[i], i*2)
            ex3.draw_dynamic_sprite(0, 0, enemy_x[i], enemy_y[i], i*2+1)
        end
    end
    if timer & 127 == 127 then
        enemy_out = 1
    end

    -- gameover or defeat
    for i = 0, 3 do
        tmpx=enemy_x[i]-pacman_x
        tmpy=enemy_y[i]-pacman_y
        if tmpx<17 and tmpx>-17 and tmpy<17 and tmpy>-17 then
            if enemy_state[i]==0 then -- normal
                goto gameover
            else -- weak
                enemy_state[i] = 2
                -- TODO : kill anim
            end
        end
    end

    -- defeat enemy


    ex3.sleep()
    timer = timer + 1
    if weak_timer then
        weak_timer = weak_timer + 1
        if weak_timer >= 300 then
            weak_timer = 0
            for i = 0, 3 do
                if enemy_state[i] == 1 then
                    enemy_state[i] = 0
                end
            end
        end
    end

    -- end
    if cleared then break end
end

-- 5000 chou
for i = 0, 3 do
    ex3.draw_dynamic_sprite(20+i, 0, -50+i*32+pacman_x, -40+pacman_y, i)
end
for i = 0, 3 do
    ex3.draw_dynamic_sprite(0, 0, 0, 0, i+4)
end

-- clear wait
for t = 0, 40 do
    ex3.sleep()
end

-- CLEAR
for i = 0, 4 do
    ex3.draw_static_sprite(32+3+i, 0, i+(12+x_gap), 18+y_gap)
end

-- clear animation
count = 0
for t = 0, 56 do
    if t == (t >> 3) * 8 then
        count = count + 32
        if count == 64 then count = 0 end
    end
    for y = 0, 27 do
        for x = 0, 30 do
            m = map[x+y*31]
            if m & 8 == 8 then
                ex3.draw_static_sprite(m+count, 0, x+x_gap, y+y_gap)
            end
        end
    end
    ex3.sleep()
end

-- wait
while 1 do
    ex3.sleep()
end


::gameover::
    for i = 0, 30 do
        ex3.sleep()
    end
    for i = 0, 11 do
        ex3.draw_dynamic_sprite(16+(i>>2), 3, pacman_x, pacman_y, 8)
        ex3.sleep()
    end
    for i = 0, 31 do
        ex3.draw_dynamic_sprite(24+(i>>2), 0, pacman_x, pacman_y, 8)
        ex3.sleep()
    end
    ex3.draw_dynamic_sprite(0, 0, pacman_x, pacman_y, 8)
    ex3.sleep()

    goto restart
