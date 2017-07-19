y = 0
while y < 30 do
    x = 0
    while x < 40 do
        ex3.draw_static_sprite(8*7 + 7, 0, x, y)
        x = x + 1
    end
    y = y + 1
end

px = 0
py = 0
qx = 0
qy = 0

while 1 do
    r,u,d,l = ex3.get_key_state()
    
    if u then qy = qy - 1 end
    if d then qy = qy + 1 end
    if l then qx = qx - 1 end
    if r then qx = qx + 1 end
    
    px = px + 1
    py = py + 1
    if py > 480 then
        px = 0
        py = 0
    end
    
    ex3.draw_dynamic_sprite(8*7 + 0, 0, px, py, 0)
    ex3.draw_dynamic_sprite(8*0 + 0, 0, qx, qy, 1)
    
    ex3.sleep()
end