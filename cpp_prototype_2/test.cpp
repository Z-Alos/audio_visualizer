#include <cstdint>
#include <cstring>
#include <iostream>
#include "raylib.h"

// Functions Prototype 
void audioProcessorCallback(void *buffer, unsigned int frames);

// Global Vars
int16_t global_frames[1024] = {};
unsigned int global_frames_count = 0;

int main() {
    InitWindow(1280, 800, "Audio Visualizer");

    InitAudioDevice(); // Initialize audio device

    Music music = LoadMusicStream("../oui.mp3");
    AttachAudioStreamProcessor(music.stream, audioProcessorCallback);

    PlayMusicStream(music);
    bool isMusicPlaying = true;

    while (!WindowShouldClose()) {
        // Update
        UpdateMusicStream(music);

        // Music Toggle
        if (IsKeyPressed(KEY_SPACE)){
            if(isMusicPlaying){
                PauseMusicStream(music);
            }
            else {
                ResumeMusicStream(music);
            }

            // Toggle isMusicPlaying
            isMusicPlaying = !isMusicPlaying;
        }

        BeginDrawing();
        ClearBackground(RED);

        // Render
        // Draw Rect Bars
        float screen_width = GetRenderWidth();
        float screen_height = GetRenderHeight();
        float bar_width = (float)screen_width/global_frames_count;
        for (int i=0; i<global_frames_count; i++) {
            float sample = *(int16_t *)&global_frames[i];
            float t = (float)sample/INT16_MAX;
            DrawRectangle(i*bar_width, screen_height - screen_height/2 * t, bar_width, t*screen_height/2, WHITE);
        }
        
        EndDrawing();
    }

    // Terminate Program
    UnloadMusicStream(music);
    CloseAudioDevice();
    CloseWindow();

    return 0;
}

void audioProcessorCallback(void *buffer, unsigned int frames){
    float *samples = (float *)buffer; // Samples internally stored as <float>s

    // Copy Frames Globally
    memcpy(global_frames, buffer, frames*sizeof(int16_t));
    global_frames_count = frames;

    // for(unsigned int frame=0; frame<frames; frame++){
    //     float *left = &samples[frame*2 + 0], *right = &samples[frame*2 + 1];
    //     std::cout << *left << std::endl;
    // }
}

