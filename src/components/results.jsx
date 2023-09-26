export default function Results({count, startTime, attemptDetails, isCorrect}) {
    var time = `${Math.floor(startTime / 60)}:${startTime % 60 < 10 ? '0' + (startTime % 60) : startTime % 60}`
    const duration = [1, 2, 4, 7, 11, 16]
    var message = isCorrect ? `You got today's heardle within ${duration[count]} seconds starting at ${time}` : `You didn't get today's heardle, but better luck tomorrow! Start Time ${time}`
    return (
        <div>
            <div class="flex flex-row justify-center space-x-1">
                {attemptDetails.map((detail) => {
                    return (
                        <div style={{backgroundColor: detail.color}}class="h-1 w-4"/>
                    )
                })}
            </div>
            <p class="text-white">
                {message}
            </p>
        </div>
    )
}