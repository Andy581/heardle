export default function GameBar({ duration, songBar, sectionColors}){
    return (
        <div className="Bar" class="w-full border border-[#afcbdd] h-6">
            <div className="PotentialBar" style={{ width: duration / 16.0 * 100 + '%' }} class="z-10 bg-[#505050] h-[22px]" />
            <div className="ActualBar" style={{ width: songBar.width / 16.0 * 100 + '%', transitionDuration: songBar.duration + 's' }} class="z-20 bg-[#38bdf8] h-[22px] transition-all ease-linear -my-[22px]" >
            </div>
            <div className="ProgressBar" class="h-6 -my-6 grid grid-cols-16 divide-x-6">
                <div className="Section" style={{borderColor: sectionColors[0]}} class="border-r-2"/>
                <div className="Section" style={{borderColor: sectionColors[1]}} class="border-r-2"/>
                <div className="Section" style={{borderColor: sectionColors[2]}} class="border-r-2 col-span-2"/>
                <div className="Section" style={{borderColor: sectionColors[3]}} class="border-r-2 col-span-3"/>
                <div className="Section" style={{borderColor: sectionColors[4]}} class="border-r-2 col-span-4"/>
                <div className="Section" style={{borderColor: sectionColors[5]}} class="border-r-2 col-span-5"/>
            </div>
        </div>
    )

}
