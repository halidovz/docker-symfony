<?php

namespace AppBundle\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use AppBundle\Entity\Slide;

class CreateSlideCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this->setName('app:create-slide');
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
    	$em = $this->getContainer()->get('doctrine')->getManager();
        $slide_1 = new Slide;
        $slide_1->setContent(file_get_contents(__DIR__ . '/slide_seed.html'));
        $slide_2 = new Slide;
        $slide_2->setContent(file_get_contents(__DIR__ . '/slide_seed_2.html'));
        $em->persist($slide_2);
        $em->persist($slide_1);
        $em->flush();

        $output->writeln('Slide has been successfully created.');
    }
}