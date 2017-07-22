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


pacman_x = 16 * (x_gap + 23) - 8
pacman_y = 16 * (y_gap + 13)
pacman_rot = 1
pacman_anim = 0
pacman_spd = 4

small_score = 0
small_amount = 240

cleared = 0

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
            if small_score == small_amount then
                cleared = 1
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


-- Main routine

for y = 0, 27 do
    for x = 0, 30 do
        ex3.draw_static_sprite(map[x+y*31], 0, x+x_gap, y+y_gap)
    end
end
ex3.draw_dynamic_sprite(8*2+anim_index, pacman_rot, pacman_x, pacman_y, 0)

-- READY
for i = 0, 4 do
    ex3.draw_static_sprite(3+i, 0, 12+i+x_gap, 18+y_gap)
end

timer = 0
while 1 do
    timer = timer + 1
    if timer > 60 then break end
    ex3.sleep()
end

-- remove READY
for i = 0, 4 do
    ex3.draw_static_sprite(0, 0, 12+i+x_gap, 18+y_gap)
end

timer = 0
while 1 do
    -- receive input
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

    -- move pacman
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

    -- flash item
    flash_item(3, 1)
    flash_item(3, 26)
    flash_item(23, 1)
    flash_item(23, 26)

    -- draw pacman
    anim_index = pacman_anim
    if anim_index == 3 then anim_index = 1 end
    ex3.draw_dynamic_sprite(8*2+anim_index, pacman_rot, pacman_x, pacman_y, 0)

    ex3.sleep()
    timer = timer + 1

    -- end
    if cleared then break end
end

-- clear wait
count = 0
while 1 do
    count = count + 1
    if count > 40 then break end
    ex3.sleep()
end

-- CLEAR
for i = 0, 4 do
    ex3.draw_static_sprite(32+3+i, 0, 12+i+x_gap, 18+y_gap)
end

-- clear animation
timer = 0
count = 0
while 1 do
    timer = timer + 1
    if timer == (timer >> 3) * 8 then
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
    if timer == 48 then
        break
    end
    ex3.sleep()
end

-- wait
while 1 do
    ex3.sleep()
end
