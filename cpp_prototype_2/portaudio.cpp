#include <algorithm>
#include <iostream>
#include <vector>
#include <fstream>
#include <limits.h>
#include <portaudio.h>

#define SAMPLE_RATE 44100
#define FRAMES_PER_BUFFER 4096 
#define NUM_CHANNELS 2
#define PA_SAMPLE_TYPE paFloat32
// #define PA_SAMPLE_TYPE paInt32

static int recordCallback(
        const void* inputBuffer, void *outputBuffer,
        unsigned long framesPerBuffer,
        const PaStreamCallbackTimeInfo *timeInfo,
        PaStreamCallbackFlags statusFlags,
        void *userData);
void saveRawAudioSamples(
        std::vector<float>& recordedSamples,
        std::string fileName);

void listAudioDevices();

int main() {
    PaStreamParameters inputParameters;
    PaError err;
    std::vector<float> recordedSamples;

    // Initialize PortAudio
    err = Pa_Initialize();
    if(err != paNoError) {
        std::cerr << "PortAudio error: " << Pa_GetErrorText(err) << std::endl;
        return -1;
    }

    listAudioDevices();

    // Setup Input Device (According To My Setup)
    // int selectedIndex = 7;
    // const PaDeviceInfo* selectedDevice = Pa_GetDeviceInfo(selectedIndex);
    inputParameters.device = Pa_GetDefaultInputDevice(); /* default input device */
    if (inputParameters.device == paNoDevice) {
        std::cerr << "No Input Device" << Pa_GetErrorText(err) << std::endl;
    }
    inputParameters.channelCount = NUM_CHANNELS;
    inputParameters.sampleFormat = PA_SAMPLE_TYPE;
    inputParameters.suggestedLatency = Pa_GetDeviceInfo( inputParameters.device )->defaultLowInputLatency;
    inputParameters.hostApiSpecificStreamInfo = NULL;

    std::cout << Pa_GetDeviceInfo(inputParameters.device)->defaultSampleRate << std::endl;

    // Stream Initialization
    PaStream *stream; // Pointer To Start Of Stream Location
    err = Pa_OpenStream(&stream,
            &inputParameters, 
            NULL,               /* &outputParameters */
            SAMPLE_RATE,
            FRAMES_PER_BUFFER, 
            paClipOff,          /* we don't output out of range samples */
            recordCallback, 
            &recordedSamples);

    if (err != paNoError) {
        std::cerr << "PortAudio error: " << Pa_GetErrorText(err) << std::endl;
        return -1;
    }

    // Stream Start 
    err = Pa_StartStream(stream);
    if (err != paNoError) {
        std::cerr << "PortAudio error: " << Pa_GetErrorText(err) << std::endl;
        return -1;
    }

    std::cout << "Recording audio. Press Enter to stop..." << std::endl;
    std::cin.get();

    // Stop Stream
    err = Pa_StopStream(stream);
    if (err != paNoError) {
        std::cerr << "PortAudio error: " << Pa_GetErrorText(err) << std::endl;
    }

    // Close Stream
    err = Pa_CloseStream(stream);
    if (err != paNoError) {
        std::cerr << "PortAudio error: " << Pa_GetErrorText(err) << std::endl;
    }

    // Kill PortAudio Instance
    Pa_Terminate();

    // Process Recorded Samples
    std::cout << "Recorded " << recordedSamples.size() << " samples." << std::endl;
    // saveRawAudioSamples(recordedSamples);
    int maxx = INT_MIN;
    for(const int sample: recordedSamples){
        maxx = std::max(maxx, sample);
    }
    std::cout << maxx;

    return 0;
}

// Functions
static int recordCallback(
        const void* inputBuffer, void *outputBuffer,
        unsigned long framesPerBuffer,
        const PaStreamCallbackTimeInfo *timeInfo,
        PaStreamCallbackFlags statusFlags,
        void *userData) 
{
    std::vector<float> *recordedSamples = (std::vector<float> *)userData;
    const float *in = (const float *)inputBuffer;

    for (unsigned long i=0; i<framesPerBuffer; ++i) {
        recordedSamples->push_back(*in++);
    }

    return paContinue;
}

// void saveRawAudioSamples(
//         std::vector<float>& recordedSamples,
//         std::string fileName="AudioData.raw")
// {
//     // [TODO]: Handle Errors
//     std::ofstream audioFile;
//     audioFile.open(fileName);
//     audioFile.write(recordedSamples, recordedSamples.size());
//     audioFile.close();
// }

void listAudioDevices(){
    int numDevices; 
    numDevices = Pa_GetDeviceCount();

    const   PaDeviceInfo *deviceInfo;
    for(int i=0; i<numDevices; i++ )
    {
        deviceInfo = Pa_GetDeviceInfo(i);
        std::cout << "(" << i << ")" << " ";
        std::cout << deviceInfo->name << std::endl;
    }
}
